// frontend/src/components/AgentChainLog.tsx
import React, {useState} from 'react';
import styled from 'styled-components';
import {AgentLogEntry} from './AgentLogEntry';

interface AgentChainLogProps {
    log: Array<{
        agent_name: string;
        reasoning: string;
        summation: string;
    }>;
    reasoning: string;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ToggleButton = styled.button<{ isExpanded: boolean }>`
    background: none;
    border: none;
    color: ${props => props.theme.colors.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-right: 2px solid ${props => props.theme.colors.primary};
        border-bottom: 2px solid ${props => props.theme.colors.primary};
        transform: rotate(${props => props.isExpanded ? '45deg' : '-45deg'});
        transition: transform 0.2s ease;
        margin-top: ${props => props.isExpanded ? '-2px' : '2px'};
    }
`;

const LogContainer = styled.div<{ isExpanded: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
    max-height: ${props => props.isExpanded ? '2000px' : '0'};
    opacity: ${props => props.isExpanded ? '1' : '0'};
    transition: all 0.3s ease-in-out;
    padding-left: 20px;
`;

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
    const [isChainExpanded, setIsChainExpanded] = useState(false);

    return (
        <Container>
            <ToggleButton
                onClick={() => setIsChainExpanded(!isChainExpanded)}
                isExpanded={isChainExpanded}
            >
                {isChainExpanded ? '에이전트 체인 로그 숨기기' : '에이전트 체인 로그 보기'}
            </ToggleButton>

            <LogContainer isExpanded={isChainExpanded}>
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
            </LogContainer>
        </Container>
    );
};
