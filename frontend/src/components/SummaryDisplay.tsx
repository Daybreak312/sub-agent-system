// frontend/src/components/SummaryDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

interface SummaryDisplayProps {
  summary: string;
}

const Container = styled.div`
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
`;

const Label = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 8px;
  opacity: 0.8;
`;

const Content = styled.div`
  /* 마크다운 스타일링 */
  p {
    margin: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 1em 0 0.5em 0;
    color: ${props => props.theme.colors.primary};
    &:first-child {
      margin-top: 0;
    }
  }

  ul, ol {
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  code {
    background: ${props => props.theme.colors.background}88;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }

  pre {
    background: ${props => props.theme.colors.background}88;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    code {
      background: none;
      padding: 0;
    }
  }

  blockquote {
    margin: 0.5em 0;
    padding-left: 1em;
    border-left: 2px solid ${props => props.theme.colors.primary}44;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  return (
    <Container>
      <Label>답변 요약</Label>
      <Content>
        <ReactMarkdown>{summary}</ReactMarkdown>
      </Content>
    </Container>
  );
};

export default SummaryDisplay;
