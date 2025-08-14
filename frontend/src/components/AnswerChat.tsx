// frontend/src/components/AnswerChat.tsx
import React from 'react';
import styled from 'styled-components';
import AgentChainLog from './AgentChainLog';
import SummaryDisplay from './SummaryDisplay';
import FinalAnswerDisplay from './FinalAnswerDisplay';
import GlassCard from './GlassCard'; // GlassCard 컴포넌트 임포트

interface AnswerChatProps {
  response: {
    agent_chain_log: any[]; // AgentChainLogEntry[]
    agent_chain_reasoning: string;
    final_user_answer: string;
    final_answer_summary: string;
  };
}

const StyledAnswerChatContainer = styled.div`
  margin-top: ${props => props.theme.spacing.large};
  width: 70%;
  margin: ${props => props.theme.spacing.large} auto;
  text-align: left;
`;

const AnswerChat: React.FC<AnswerChatProps> = ({ response }) => {
  return (
    <StyledAnswerChatContainer>
      <h2>에이전트 응답:</h2>
      
      {response.agent_chain_log && response.agent_chain_log.length > 0 && (
        <AgentChainLog log={response.agent_chain_log} reasoning={response.agent_chain_reasoning} />
      )}

      {response.final_answer_summary && (
        <SummaryDisplay summary={response.final_answer_summary} />
      )}

      {response.final_user_answer && (
        <FinalAnswerDisplay answer={response.final_user_answer} />
      )}
    </StyledAnswerChatContainer>
  );
};

export default AnswerChat;