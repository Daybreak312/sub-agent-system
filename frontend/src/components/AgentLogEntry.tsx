// frontend/src/components/AgentLogEntry.tsx
import React from 'react';
import styled from 'styled-components';

interface AgentLogEntryProps {
  entry: {
    agent_name: string;
    reasoning: string;
    summation: string;
  };
  index: number;
}

const StyledAgentLogEntry = styled.div`
  margin-bottom: ${props => props.theme.spacing.small};
  padding: ${props => props.theme.spacing.small};
  border: 1px solid ${props => props.theme.colors.logEntryBorder};
  border-radius: ${props => props.theme.borderRadius.default};
  background-color: ${props => props.theme.colors.logEntryBackground};

  p {
    margin: 0;
    padding: 0;
    color: ${props => props.theme.colors.text}; /* 텍스트 색상 적용 */
  }

  p:first-child {
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
  }

  p:not(:first-child) {
    font-size: 0.9em;
  }
`;

const AgentLogEntry: React.FC<AgentLogEntryProps> = ({ entry, index }) => {
  return (
    <StyledAgentLogEntry>
      <p><strong>{index + 1}. {entry.agent_name}</strong></p>
      <p><strong>설명: </strong>{entry.reasoning}</p>
      <p><strong>요약: </strong>{entry.summation}</p>
    </StyledAgentLogEntry>
  );
};

export default AgentLogEntry;
