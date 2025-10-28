
export interface BaseMessage {
    id: string;
    sender: 'user' | 'ai';
    image?: string; 
}

export interface TextMessage extends BaseMessage {
    type: 'text';
    content: string;
}

export interface StoryMessage extends BaseMessage {
    type: 'story';
    story: string;
    regeneratePrompt: string;
}

export type Message = TextMessage | StoryMessage;
