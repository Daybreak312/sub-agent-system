// frontend/src/App.tsx

import React, {useState} from 'react';
import {ThemeProvider} from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';
import {PromptInput} from './components/PromptInput';
import {ChatContainer} from './components/ChatContainer';
import LiquidGlass from "liquid-glass-react";

interface Message {
    type: 'user' | 'agent';
    content: any;
    timestamp: Date;
    isLoading?: boolean;
}

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(event.target.value);
    };

    const handleSubmit = async () => {
        if (!prompt.trim() || loading) return;

        setLoading(true);

        // 사용자 메시지 즉시 추가
        const userMessage: Message = {
            type: 'user',
            content: prompt.trim(),
            timestamp: new Date()
        };

        // 로딩 상태의 임시 에이전트 메시지 추가
        const loadingMessage: Message = {
            type: 'agent',
            content: {},
            timestamp: new Date(),
            isLoading: true
        };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setPrompt(''); // 입력창 초기화

        try {
            const response = await fetch('http://localhost:3000/api/prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({prompt: userMessage.content}),
            });

            if (!response.ok) {
                throw new Error('서버 요청에 실패했습니다.');
            }

            const data = await response.json();

            // 로딩 메시지를 실제 응답으로 교체
            setMessages(prev => {
                const newMessages = [...prev];
                const loadingIndex = newMessages.findIndex(msg => msg.isLoading);
                if (loadingIndex !== -1) {
                    newMessages[loadingIndex] = {
                        type: 'agent',
                        content: data,
                        timestamp: new Date()
                    };
                }
                return newMessages;
            });
        } catch (error) {
            // 에러 발생 시 로딩 메시지를 에러 메시지로 교체
            setMessages(prev => {
                const newMessages = [...prev];
                const loadingIndex = newMessages.findIndex(msg => msg.isLoading);
                if (loadingIndex !== -1) {
                    newMessages[loadingIndex] = {
                        type: 'agent',
                        content: {error: '요청 처리 중 오류가 발생했습니다.'},
                        timestamp: new Date()
                    };
                }
                return newMessages;
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles/>
            <ChatContainer messages={messages}/>
            <PromptInput
                prompt={prompt}
                loading={loading}
                onPromptChange={handlePromptChange}
                onSubmit={handleSubmit}
            />
        </ThemeProvider>
    );
}

export default App;