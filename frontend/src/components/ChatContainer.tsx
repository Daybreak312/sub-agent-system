import React, {useEffect, useRef} from 'react';
import styled from 'styled-components';
import {UserMessage} from './UserMessage';
import {AnswerChat} from './AnswerChat';

interface Message {
    type: 'user' | 'agent';
    content: any;
    timestamp: Date;
    isLoading?: boolean;
}

interface ChatContainerProps {
    messages: Message[];
}

const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow: hidden;
    background: ${props => props.theme.colors.background};
`;

const ScrollableArea = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0 12px 300px;

    &::-webkit-scrollbar {
        width: 6px;
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme.colors.primary}22;
        border-radius: 3px;

        &:hover {
            background: ${props => props.theme.colors.primary}44;
        }
    }
`;

const MessagesContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 32px;
`;

const MessageWrapper = styled.div<{ isUser: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
    gap: 8px;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.3s ease, transform 0.3s ease;

    &[data-entering="true"] {
        opacity: 0;
        transform: translateY(20px);
    }
`;

export const ChatContainer: React.FC<ChatContainerProps> = ({messages}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<Map<string, boolean>>(new Map());

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 새 메시지가 추가될 때 애니메이션 처리
    useEffect(() => {
        messages.forEach((msg, index) => {
            const key = `${msg.type}-${msg.timestamp.getTime()}-${index}`;
            if (!messageRefs.current.has(key)) {
                messageRefs.current.set(key, true);
                setTimeout(() => {
                    const element = document.querySelector(`[data-message-key="${key}"]`);
                    if (element) {
                        element.setAttribute('data-entering', 'false');
                    }
                }, 100);
            }
        });
    }, [messages]);

    return (
        <Container>
            <ScrollableArea ref={scrollRef}>
                <MessagesContainer>
                    {messages.map((message, index) => {
                        const key = `${message.type}-${message.timestamp.getTime()}-${index}`;
                        return (
                            <MessageWrapper
                                key={key}
                                data-message-key={key}
                                data-entering="true"
                                isUser={message.type === 'user'}
                            >
                                {message.type === 'user' ? (
                                    <UserMessage content={message.content}/>
                                ) : (
                                    <AnswerChat
                                        response={message.content}
                                        isLoading={message.isLoading}
                                    />
                                )}
                            </MessageWrapper>
                        );
                    })}
                </MessagesContainer>
            </ScrollableArea>
        </Container>
    );
};
