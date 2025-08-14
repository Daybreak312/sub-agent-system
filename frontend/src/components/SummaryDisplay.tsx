// frontend/src/components/SummaryDisplay.tsx
import React from 'react';
import styled from 'styled-components';

interface SummaryDisplayProps {
  summary: string;
}

const StyledSummaryContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
  border: 1px solid ${props => props.theme.colors.cardBorder};
  padding: ${props => props.theme.spacing.small};
  border-radius: ${props => props.theme.borderRadius.default};
  background-color: ${props => props.theme.colors.cardBackground};

  h3 {
    margin-top: 0;
    margin-bottom: ${props => props.theme.spacing.small};
    color: ${props => props.theme.colors.text};
  }

  p {
    margin: 0;
    color: ${props => props.theme.colors.text};
  }
`;

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  return (
    <StyledSummaryContainer>
      <h3>요약:</h3>
      <p>{summary}</p>
    </StyledSummaryContainer>
  );
};

export default SummaryDisplay;
