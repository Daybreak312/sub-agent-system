import React from 'react';
import styled from 'styled-components';
import { UserMessage } from './UserMessage';
import { AnswerChat } from './AnswerChat';

interface Message {
  type: 'user' | 'agent';
  content: any;
  timestamp: Date;
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
`;

const ScrollableArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  margin-bottom: 100px; /* PromptInput을 위한 여백 */
  
  /* 스크롤바 스타일링 */
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
`;

const TimeIndicator = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 12px;
`;

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages }) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Container>
      <ScrollableArea>
        <MessagesContainer>
          {messages.map((message, index) => (
            <MessageWrapper key={index} isUser={message.type === 'user'}>
              {message.type === 'user' ? (
                <UserMessage
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ) : (
                <AnswerChat response={message.content} />
              )}
              <TimeIndicator>{formatTime(message.timestamp)}</TimeIndicator>
            </MessageWrapper>
          ))}
        </MessagesContainer>
      </ScrollableArea>
    </Container>
  );
};
