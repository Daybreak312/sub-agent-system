// frontend/src/components/AgentChainLog.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import AgentLogEntry from './AgentLogEntry'; // Import the sub-component

interface AgentChainLogProps {
  log: any[]; // AgentChainLogEntry[]
  reasoning: string; // overall_reasoning
}

const StyledAgentChainLogContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
  border: 1px solid ${props => props.theme.colors.cardBorder};
  padding: ${props => props.theme.spacing.small};
  border-radius: ${props => props.theme.borderRadius.default};
  background-color: ${props => props.theme.colors.cardBackground};
`;

const StyledLogContent = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.default};
  padding: ${props => props.theme.spacing.small};
  background-color: ${props => props.theme.colors.logEntryBackground}; /* 배경색 추가 */
`;

const StyledToggleHeader = styled.h3`
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0; /* 기본 h3 마진 제거 */
  margin-bottom: ${props => props.theme.spacing.small};
`;

const AgentChainLog: React.FC<AgentChainLogProps> = ({ log, reasoning }) => {
  const [showLog, setShowLog] = useState<boolean>(false);

  return (
    <StyledAgentChainLogContainer>
      <StyledToggleHeader 
        onClick={() => setShowLog(prev => !prev)} 
      >
        <span>에이전트 체인 로그:</span>
        <span>{showLog ? '▲' : '▼'}</span>
      </StyledToggleHeader>
      {showLog && (
        <StyledLogContent>
          <p><strong>계획 설명: </strong>{reasoning}</p>
          {log.map((entry: any, index: number) => (
            <AgentLogEntry key={index} entry={entry} index={index} />
          ))}
        </StyledLogContent>
      )}
    </StyledAgentChainLogContainer>
  );
};

export default AgentChainLog;
