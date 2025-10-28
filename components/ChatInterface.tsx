import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';
import { LoadingIcon } from './icons';

interface ChatInterfaceProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (text: string, image?: { data: string; mimeType: string }) => void;
    onReadAloud: (text: string, messageId: string) => void;
    activeTtsMessageId: string | null;
    language: 'en' | 'fr';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, onReadAloud, activeTtsMessageId, language }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const thinkingText = language === 'fr' ? "L'IA réfléchit..." : "AI is thinking...";

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg}
                        onReadAloud={onReadAloud}
                        isTtsLoading={activeTtsMessageId === msg.id}
                        language={language}
                    />
                ))}
                 {isLoading && (
                    <div className="flex justify-start items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex-shrink-0"></div>
                        <div className="bg-gray-700 rounded-lg p-3 max-w-lg flex items-center space-x-2">
                           <LoadingIcon />
                           <span>{thinkingText}</span>
                        </div>
                    </div>
                )}
            </main>
            <div className="p-4 md:p-6 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
                <InputBar onSendMessage={onSendMessage} disabled={isLoading} language={language} />
            </div>
        </div>
    );
};

export default ChatInterface;