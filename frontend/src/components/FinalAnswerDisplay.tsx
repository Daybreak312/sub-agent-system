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
            
            <ReactMarkdown>{answer}</ReactMarkdown>
        </StyledFinalAnswerContainer>
    );
};

export default FinalAnswerDisplay;
