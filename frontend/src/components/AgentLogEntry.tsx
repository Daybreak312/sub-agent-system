// frontend/src/components/AgentLogEntry.tsx
import React from 'react';
import styled from 'styled-components';
import {VerticalLineContainer} from './VerticalLineContainer';
import {ToggleSection} from './ToggleSection';

interface AgentLogEntryProps {
    agentName: string;
    reasoning: string;
    summation: string;
}

const Container = styled(VerticalLineContainer)`
    margin: 0;
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
            <ToggleSection
                label={agentName}
                leftPadding="20px"
            >
                <Section>
                    <SectionTitle>추론 과정</SectionTitle>
                    {reasoning}
                </Section>
                <Section>
                    <SectionTitle>답변 요약</SectionTitle>
                    {summation}
                </Section>
            </ToggleSection>
        </Container>
    );
};

export default AgentLogEntry;