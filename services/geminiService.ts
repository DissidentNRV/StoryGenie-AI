import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';
const ttsModel = 'gemini-2.5-flash-preview-tts';

const storySchema = {
    type: Type.OBJECT,
    properties: {
        story: {
            type: Type.STRING,
            description: "An engaging opening paragraph for a story, inspired by the image. It should establish a compelling mood and setting in about 150-200 words.",
        },
        regenerate_prompt: {
            type: Type.STRING,
            description: "A detailed and descriptive prompt that could be used with an image generation AI to recreate the provided image. Include details about style, composition, lighting, and subject.",
        },
    },
    required: ["story", "regenerate_prompt"],
};

export const generateStoryAndPrompt = async (imageData: string, mimeType: string, language: 'en' | 'fr'): Promise<{ story: string; regenerate_prompt: string }> => {
    const imagePart = {
        inlineData: { data: imageData, mimeType },
    };
    const textPart = {
        text: language === 'fr'
            ? "Analyse l'ambiance et la scène de cette image. Rédige un paragraphe d'ouverture pour une histoire se déroulant dans ce monde. Crée également une invite pour régénérer cette image. Le contenu textuel de ta réponse doit être en français, mais les clés JSON doivent rester 'story' et 'regenerate_prompt'."
            : "Analyze the mood and scene of this image. Ghostwrite an opening paragraph for a story set in this world. Also, create a prompt to regenerate this image. The textual content of your response must be in English, but the JSON keys must remain 'story' and 'regenerate_prompt'."
    };

    const response = await ai.models.generateContent({
        model: textModel,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: storySchema,
        },
    });
    
    const resultJson = response.text.trim();
    try {
        return JSON.parse(resultJson);
    } catch (e) {
        console.error("Failed to parse JSON response:", resultJson);
        throw new Error("Received an invalid format from the AI.");
    }
};

export const continueChat = async (prompt: string, history: Message[], language: 'en' | 'fr'): Promise<string> => {
    const chat = ai.chats.create({
        model: textModel,
        history: history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.type === 'text' ? msg.content : msg.story }]
        })),
        config: {
            systemInstruction: language === 'fr'
                ? "Tu es un assistant amical et serviable. Toutes tes réponses doivent être en français."
                : "You are a friendly and helpful assistant. All of your responses must be in English."
        }
    });

    const response = await chat.sendMessage({ message: prompt });
    return response.text;
};


export const generateSpeech = async (text: string, language: 'en' | 'fr'): Promise<string> => {
    const prompt = language === 'fr'
        ? `Lis cet extrait d'histoire avec une voix narrative et expressive : ${text}`
        : `Read this story excerpt with an expressive, narrative voice: ${text}`;
        
    const response = await ai.models.generateContent({
        model: ttsModel,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck is a multilingual voice
                },
            },
        },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
        throw new Error("No audio data received from API.");
    }
    return audioData;
};