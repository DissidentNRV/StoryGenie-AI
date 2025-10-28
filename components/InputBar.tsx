import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { SendIcon, PaperclipIcon, XIcon } from './icons';

interface InputBarProps {
    onSendMessage: (text: string, image?: { data: string; mimeType: string }) => void;
    disabled: boolean;
    language: 'en' | 'fr';
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, disabled, language }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState<{ file: File; preview: string; } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const preview = URL.createObjectURL(file);
            setImage({ file, preview });
        }
    };

    const handleSend = () => {
        const messageText = text.trim();
        if (disabled || (!messageText && !image)) return;
        
        const defaultAnalyzeText = language === 'fr' ? "Analyse cette image et crée une histoire." : "Analyze this image and create a story.";

        if (image) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = (reader.result as string).split(',')[1];
                onSendMessage(messageText || defaultAnalyzeText, { data: base64Data, mimeType: image.file.type });
                cleanup();
            };
            reader.readAsDataURL(image.file);
        } else {
            onSendMessage(messageText);
            cleanup();
        }
    };

    const cleanup = () => {
        setText('');
        if (image) {
            URL.revokeObjectURL(image.preview);
        }
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const placeholderText = image 
        ? (language === 'fr' ? "Ajoutez un message à propos de l'image..." : "Add a message about the image...")
        : (language === 'fr' ? "Tapez votre message ou téléchargez une image..." : "Type your message or upload an image...");

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-2 flex flex-col items-center shadow-lg">
             {image && (
                <div className="w-full p-2 relative">
                    <img src={image.preview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                    <button
                        onClick={() => {
                            if (image) URL.revokeObjectURL(image.preview);
                            setImage(null);
                             if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-3 right-3 bg-black/50 rounded-full p-1 text-white hover:bg-black/80 transition-colors"
                    >
                        <XIcon />
                    </button>
                </div>
            )}
            <div className="w-full flex items-end space-x-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <PaperclipIcon />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={disabled}
                />
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholderText}
                    className="flex-1 bg-transparent resize-none p-2 focus:outline-none text-gray-200 placeholder-gray-500"
                    rows={1}
                    disabled={disabled}
                    style={{ maxHeight: '120px' }}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || (!text.trim() && !image)}
                    className="bg-cyan-600 text-white rounded-full p-2.5 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                >
                   <SendIcon />
                </button>
            </div>
        </div>
    );
};

export default InputBar;