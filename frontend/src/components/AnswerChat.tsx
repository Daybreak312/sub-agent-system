// frontend/src/components/AnswerChat.tsx
import React from 'react';
import AgentChainLog from './AgentChainLog';
import SummaryDisplay from './SummaryDisplay';
import FinalAnswerDisplay from './FinalAnswerDisplay';

interface AnswerChatProps {
  response: {
    agent_chain_log: any[]; // AgentChainLogEntry[]
    agent_chain_reasoning: string;
    final_user_answer: string;
    final_answer_summary: string;
  };
}

const AnswerChat: React.FC<AnswerChatProps> = ({ response }) => {
  return (
    <div style={{
      marginTop: '20px',
      border: '1px solid #eee',
      padding: '15px',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
      width: '70%',
      margin: '0 auto',
      textAlign: 'left'
    }}>
      <h2>에이전트 응답</h2>
      
      {response.agent_chain_log && response.agent_chain_log.length > 0 && (
        <AgentChainLog log={response.agent_chain_log} reasoning={response.agent_chain_reasoning} />
      )}

      {response.final_answer_summary && (
        <SummaryDisplay summary={response.final_answer_summary} />
      )}

      {response.final_user_answer && (
        <FinalAnswerDisplay answer={response.final_user_answer} />
      )}
    </div>
  );
};

export default AnswerChat;
