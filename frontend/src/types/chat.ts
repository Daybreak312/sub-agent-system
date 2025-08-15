export interface Message {
    type: 'user' | 'agent';
    content: any;
    timestamp: Date;
    isLoading?: boolean;
}

