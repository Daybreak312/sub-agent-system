import React from 'react';
import styled from 'styled-components';
import { GlassCard } from './GlassCard';

interface UserMessageProps {
  content: string;
}

const MessageContainer = styled(GlassCard)`
  align-self: flex-end;
  max-width: 80%;
  margin-left: auto;
  background: ${props => props.theme.colors.primary}44; /* 알파값으로 투명도 조절 */
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.colors.primary}22;
  padding: 16px;
`;

const MessageContent = styled.div`
    color: ${props => props.theme.colors.text};
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
`;

export const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  return (
    <MessageContainer>
      <MessageContent>{content}</MessageContent>
    </MessageContainer>
  );
};

export default UserMessage;