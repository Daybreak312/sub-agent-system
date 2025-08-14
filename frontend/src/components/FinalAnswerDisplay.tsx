// frontend/src/components/FinalAnswerDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

interface FinalAnswerDisplayProps {
    answer: string;
}

const StyledFinalAnswerContainer = styled.div`
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

const FinalAnswerDisplay: React.FC<FinalAnswerDisplayProps> = ({answer}) => {
    return (
        <StyledFinalAnswerContainer>
            <h3>최종 답변:</h3>
            <ReactMarkdown>{answer}</ReactMarkdown>
        </StyledFinalAnswerContainer>
    );
};

export default FinalAnswerDisplay;
