import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {ChatContainer} from '../components/ChatContainer';
import {PromptInput} from '../components/PromptInput';
import {useWebSocket} from '../hooks/useWebSocket';
import type {Message} from '../types/chat';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    gap: 20px;
`;

export const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const {progress} = useWebSocket();

    // WebSocket으로 받은 진행상황을 requestId 기반으로 올바른 메시지에 반영
    useEffect(() => {
        if (progress && progress.requestId) {
            console.log('WebSocket 진행상황 업데이트:', progress);

            setMessages(prev => {
                const newMessages = [...prev];

                const targetIndex = newMessages.findIndex(msg =>
                    msg.requestId === progress.requestId
                );

                if (targetIndex !== -1) {
                    // 해당 메시지만 업데이트
                    newMessages[targetIndex] = {
                        ...newMessages[targetIndex],
                        content: progress,
                        isLoading: !progress.final_user_answer,
                        timestamp: new Date()
                    };

                    // 작업이 완료되면 현재 활성 요청도 초기화
                    if (!progress.final_user_answer) {
                        setLoading(false);
                    }
                }

                return newMessages;
            });
        }
    }, [progress]);

    const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(event.target.value);
    };

    const handleSubmit = async () => {
        if (!prompt.trim() || loading) return;

        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
            isLoading: true,
            requestId: requestId // 중요: requestId 포함
        };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setPrompt(''); // 입력창 초기화

        try {
            const response = await fetch('http://localhost:3000/api/prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'request-id': requestId  // 중요: request-id 헤더 추가
                },
                body: JSON.stringify({prompt: userMessage.content}),
            });

            if (!response.ok) {
                throw new Error('서버 요청에 실패했습니다.');
            }

            const data = await response.json();
            console.log('HTTP 요청 완료:', data);

            // WebSocket으로 실시간 업데이트를 받고 있으므로
            // HTTP 응답은 최종 확인용으로만 사용

        } catch (error) {
            console.error('요청 처리 중 오류:', error);

            // 에러 발생 시 해당 requestId의 메시지만 에러로 교체
            setMessages(prev => {
                const newMessages = [...prev];
                const errorIndex = newMessages.findIndex(msg =>
                    msg.requestId === requestId
                );

                if (errorIndex !== -1) {
                    newMessages[errorIndex] = {
                        ...newMessages[errorIndex],
                        content: {error: '요청 처리 중 오류가 발생했습니다.'},
                        isLoading: false
                    };
                }
                return newMessages;
            });

            setLoading(false);
        }
    };

    return (
        <Container>
            <ChatContainer messages={messages}/>
            <PromptInput
                prompt={prompt}
                onPromptChange={handlePromptChange}
                onSubmit={handleSubmit}
                loading={loading}
            />
        </Container>
    );
};
