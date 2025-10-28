import React, { useState, useCallback } from 'react';
import { Message } from './types';
import { generateStoryAndPrompt, generateSpeech, continueChat } from './services/geminiService';
import { playAudio } from './utils/audio';
import ChatInterface from './components/ChatInterface';
import { v4 as uuidv4 } from 'uuid';

const LanguageSelector: React.FC<{
    currentLanguage: 'en' | 'fr';
    onLanguageChange: (lang: 'en' | 'fr') => void;
}> = ({ currentLanguage, onLanguageChange }) => {
    const commonClasses = "px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-800";
    const activeClasses = "bg-cyan-600 text-white";
    const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

    return (
        <div className="flex items-center space-x-2 p-1 bg-gray-800 rounded-lg">
            <button
                onClick={() => onLanguageChange('en')}
                className={`${commonClasses} ${currentLanguage === 'en' ? activeClasses : inactiveClasses}`}
            >
                English
            </button>
            <button
                onClick={() => onLanguageChange('fr')}
                className={`${commonClasses} ${currentLanguage === 'fr' ? activeClasses : inactiveClasses}`}
            >
                Français
            </button>
        </div>
    );
};


const App: React.FC = () => {
    const [language, setLanguage] = useState<'en' | 'fr'>('fr');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial-message',
            sender: 'ai',
            type: 'text',
            content: "Bienvenue ! Téléchargez une image pour commencer une histoire, ou posez-moi une question."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTtsMessageId, setActiveTtsMessageId] = useState<string | null>(null);

    const handleSendMessage = useCallback(async (text: string, image?: { data: string; mimeType: string }) => {
        setIsLoading(true);
        const userMessageId = uuidv4();
        const userMessage: Message = {
            id: userMessageId,
            sender: 'user',
            type: 'text',
            content: text,
            image: image ? image.data : undefined
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            if (image) {
                const result = await generateStoryAndPrompt(image.data, image.mimeType, language);
                const aiMessage: Message = {
                    id: uuidv4(),
                    sender: 'ai',
                    type: 'story',
                    story: result.story,
                    regeneratePrompt: result.regenerate_prompt
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                 const history = messages;
                 const responseText = await continueChat(text, history, language);
                 const aiMessage: Message = {
                    id: uuidv4(),
                    sender: 'ai',
                    type: 'text',
                    content: responseText
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error("Error processing message:", error);
            const errorMessageContent = language === 'fr' 
                ? "Désolé, j'ai rencontré une erreur. Veuillez réessayer."
                : "Sorry, I encountered an error. Please try again.";
            const errorMessage: Message = {
                id: uuidv4(),
                sender: 'ai',
                type: 'text',
                content: errorMessageContent
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, language]);

    const handleReadAloud = useCallback(async (text: string, messageId: string) => {
        setActiveTtsMessageId(messageId);
        try {
            const audioData = await generateSpeech(text, language);
            await playAudio(audioData);
        } catch (error) {
            console.error("Error generating or playing speech:", error);
        } finally {
            setActiveTtsMessageId(null);
        }
    }, [language]);

    return (
        <div className="flex flex-col h-screen bg-gray-900 font-sans">
             <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 shadow-lg sticky top-0 z-10 flex justify-between items-center">
                <div className="w-1/3"></div>
                <h1 className="w-1/3 text-xl md:text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    Creative Storyteller AI
                </h1>
                <div className="w-1/3 flex justify-end">
                    <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
                </div>
            </header>
            <ChatInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onReadAloud={handleReadAloud}
                activeTtsMessageId={activeTtsMessageId}
                language={language}
            />
        </div>
    );
};

export default App;