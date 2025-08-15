// frontend/src/components/AgentChainLog.tsx
import React from 'react';
import styled from 'styled-components';
import {AgentLogEntry} from './AgentLogEntry';
import {ToggleSection} from './ToggleSection';

interface AgentChainLogProps {
    log: Array<{
        agent_name: string;
        reasoning: string;
        summation: string;
    }>;
    reasoning: string;
}

const ReasoningSection = styled.div`
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    font-size: 0.95rem;
    padding: 16px;
    border-left: 2px solid ${props => props.theme.colors.primary}22;
    margin: 8px 0 16px 0;
`;

const AgentList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const SectionTitle = styled.div`
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.85rem;
    margin-bottom: 8px;
`;

export const AgentChainLog: React.FC<AgentChainLogProps> = ({log, reasoning}) => {
    return (
        <ToggleSection
            label="에이전트 체인 로그 보기"
            leftPadding="20px"
        >
            <div>
                <SectionTitle>실행 계획</SectionTitle>
                <ReasoningSection>{reasoning}</ReasoningSection>
            </div>

            <AgentList>
                {log.map((entry, index) => (
                    <AgentLogEntry
                        key={index}
                        agentName={entry.agent_name}
                        reasoning={entry.reasoning}
                        summation={entry.summation}
                    />
                ))}
            </AgentList>
        </ToggleSection>
    );
};
