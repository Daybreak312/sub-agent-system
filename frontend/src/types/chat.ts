export interface Message {
    type: 'user' | 'agent';
    content: any;
    timestamp: Date;
    isLoading?: boolean;
    requestId?: string;  // requestId 필드 추가
}
