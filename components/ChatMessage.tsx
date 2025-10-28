import React from 'react';
import { Message } from '../types';
import { UserIcon, ReadAloudIcon, LoadingIcon, CopyIcon } from './icons';

interface ChatMessageProps {
    message: Message;
    onReadAloud: (text: string, messageId: string) => void;
    isTtsLoading: boolean;
    language: 'en' | 'fr';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onReadAloud, isTtsLoading, language }) => {

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const storyTitle = language === 'fr' ? "Votre histoire commence..." : "Your Story Begins...";
    const readAloudButtonText = language === 'fr' ? 'Lire à voix haute' : 'Read Aloud';
    const generatingButtonText = language === 'fr' ? 'Génération...' : 'Generating...';
    const regenPromptTitle = language === 'fr' ? "Invite de régénération d'image" : "Image Regeneration Prompt";
    const copyButtonTitle = language === 'fr' ? 'Copier l’invite' : 'Copy prompt';

    if (message.sender === 'user') {
        return (
            <div className="flex justify-end items-start space-x-3">
                <div className="bg-blue-600 rounded-lg p-3 max-w-lg">
                    {message.image && (
                        <img src={message.image} alt="User upload" className="rounded-lg mb-2 max-h-64" />
                    )}
                    <p className="text-white break-words">{message.type === 'text' && message.content}</p>
                </div>
                 <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <UserIcon />
                 </div>
            </div>
        );
    }
    
    // AI Message
    return (
        <div className="flex justify-start items-start space-x-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex-shrink-0"></div>
            {message.type === 'text' ? (
                <div className="bg-gray-700 rounded-lg p-3 max-w-lg">
                    <p className="text-gray-200 break-words whitespace-pre-wrap">{message.content}</p>
                </div>
            ) : ( // Story type
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-2xl w-full shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">{storyTitle}</h3>
                        <button
                            onClick={() => onReadAloud(message.story, message.id)}
                            disabled={isTtsLoading}
                            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                            {isTtsLoading ? <LoadingIcon /> : <ReadAloudIcon />}
                            <span>{isTtsLoading ? generatingButtonText : readAloudButtonText}</span>
                        </button>
                    </div>

                    <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">{message.story}</p>
                    
                    <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-sm font-semibold text-gray-400">{regenPromptTitle}</h4>
                             <button
                                onClick={() => copyToClipboard(message.regeneratePrompt)}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                title={copyButtonTitle}
                            >
                                <CopyIcon />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 font-mono bg-black/30 p-2 rounded break-words">{message.regeneratePrompt}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;