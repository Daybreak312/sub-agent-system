// frontend/src/components/FinalAnswerDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import {markdownStyles} from '../styles/MarkdownStyles';

interface FinalAnswerDisplayProps {
    answer: string;
}

const Container = styled.div`
    ${markdownStyles}
`;

const FinalAnswerDisplay: React.FC<FinalAnswerDisplayProps> = ({answer}) => {
    return (
        <Container>
            <ReactMarkdown>{answer}</ReactMarkdown>
        </Container>
    );
};

export default FinalAnswerDisplay;
