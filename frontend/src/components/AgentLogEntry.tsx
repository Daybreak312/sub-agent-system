// frontend/src/components/AgentLogEntry.tsx
import React from 'react';
import styled from 'styled-components';

interface AgentLogEntryProps {
  agentName: string;
  reasoning: string;
  summation: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 16px;
  border-left: 2px solid ${props => props.theme.colors.primary}22;
`;

const AgentName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  font-size: 0.9rem;
`;

const Section = styled.div`
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
  line-height: 1.6;

  & + & {
    margin-top: 8px;
  }
`;

const SectionTitle = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  margin-bottom: 4px;
`;

export const AgentLogEntry: React.FC<AgentLogEntryProps> = ({
  agentName,
  reasoning,
  summation,
}) => {
  return (
    <Container>
      <AgentName>{agentName}</AgentName>
      <Section>
        <SectionTitle>추론 과정</SectionTitle>
        {reasoning}
      </Section>
      <Section>
        <SectionTitle>요약</SectionTitle>
        {summation}
      </Section>
    </Container>
  );
};
