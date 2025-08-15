// frontend/src/components/SummaryDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { markdownStyles } from '../styles/MarkdownStyles';
import { VerticalLineContainer } from './VerticalLineContainer';

interface SummaryDisplayProps {
  summary: string;
}

const Container = styled(VerticalLineContainer)`
  margin: 0;
`;

const Content = styled.div`
  ${markdownStyles}
  padding-left: 20px;
`;

const SectionTitle = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
  margin-bottom: 0;
  margin-left: 0;
`;

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  return (
    <Container>
      <SectionTitle>답변 요약</SectionTitle>
      <Content>
        <ReactMarkdown>{summary}</ReactMarkdown>
      </Content>
    </Container>
  );
};
