// frontend/src/components/AgentLogEntry.tsx
import React, {useState} from 'react';
import styled from 'styled-components';
import {VerticalLineContainer} from './VerticalLineContainer';

interface AgentLogEntryProps {
    agentName: string;
    reasoning: string;
    summation: string;
}

const Container = styled(VerticalLineContainer)`
  margin: 0;
`;

const AgentNameButton = styled.button<{ isExpanded: boolean }>`
    background: none;
    border: none;
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
    font-size: 0.9rem;
    opacity: 0.9;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }

    &::after {
        content: '';
        width: 5px;
        height: 5px;
        border-right: 1.5px solid ${props => props.theme.colors.primary};
        border-bottom: 1.5px solid ${props => props.theme.colors.primary};
        transform: rotate(${props => props.isExpanded ? '45deg' : '-45deg'});
        transition: transform 0.2s ease;
        margin-top: ${props => props.isExpanded ? '-2px' : '2px'};
    }
`;

const Content = styled.div<{ isExpanded: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
    max-height: ${props => props.isExpanded ? '1000px' : '0'};
    opacity: ${props => props.isExpanded ? '1' : '0'};
    transition: all 0.3s ease-in-out;
`;

const Section = styled.div`
    color: ${props => props.theme.colors.text};
    font-size: 0.9rem;
    line-height: 1.6;
    padding-left: 20px;

    & + & {
        margin-top: 8px;
    }
`;

const SectionTitle = styled.div`
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.8rem;
    margin-bottom: 4px;
    margin-left: -20px;
`;

export const AgentLogEntry: React.FC<AgentLogEntryProps> = ({
                                                                agentName,
                                                                reasoning,
                                                                summation,
                                                            }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Container>
            <AgentNameButton
                onClick={() => setIsExpanded(!isExpanded)}
                isExpanded={isExpanded}
            >
                {agentName}
            </AgentNameButton>
            <Content isExpanded={isExpanded}>
                <Section>
                    <SectionTitle>추론 과정</SectionTitle>
                    {reasoning}
                </Section>
                <Section>
                    <SectionTitle>답변 요약</SectionTitle>
                    {summation}
                </Section>
            </Content>
        </Container>
    );
};

export default AgentLogEntry;