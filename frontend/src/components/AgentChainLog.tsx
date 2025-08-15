// frontend/src/components/AgentChainLog.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import AgentLogEntry from './AgentLogEntry';

interface AgentChainLogProps {
  log: Array<{
    agent_name: string;
    reasoning: string;
    summation: string;
  }>;
  reasoning: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReasoningSection = styled.div`
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  font-size: 0.95rem;
`;

const ToggleButton = styled.button<{ isExpanded: boolean }>`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-right: 2px solid ${props => props.theme.colors.primary};
    border-bottom: 2px solid ${props => props.theme.colors.primary};
    transform: rotate(${props => props.isExpanded ? '45deg' : '-45deg'});
    transition: transform 0.2s ease;
    margin-top: ${props => props.isExpanded ? '-2px' : '2px'};
  }
`;

const LogEntries = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  max-height: ${props => props.isExpanded ? '1000px' : '0'};
  opacity: ${props => props.isExpanded ? '1' : '0'};
  transition: all 0.3s ease-in-out;
`;

export const AgentChainLog: React.FC<AgentChainLogProps> = ({ log, reasoning }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Container>
      <ReasoningSection>{reasoning}</ReasoningSection>
      <div>
        <ToggleButton
          onClick={() => setIsExpanded(!isExpanded)}
          isExpanded={isExpanded}
        >
          {isExpanded ? '에이전트 체인 로그 숨기기' : '에이전트 체인 로그 보기'}
        </ToggleButton>
        <LogEntries isExpanded={isExpanded}>
          {log.map((entry, index) => (
            <AgentLogEntry
              key={index}
              agentName={entry.agent_name}
              reasoning={entry.reasoning}
              summation={entry.summation}
            />
          ))}
        </LogEntries>
      </div>
    </Container>
  );
};
