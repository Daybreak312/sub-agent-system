// frontend/src/components/AnswerChat.tsx
import React from 'react';
import styled from 'styled-components';
import {LoadingDots} from './LoadingDots';
import {AgentChainLog} from './AgentChainLog';
import {SummaryDisplay} from './SummaryDisplay';
import FinalAnswerDisplay from './FinalAnswerDisplay';
import reactLogo from '../assets/react.svg';

interface Response {
    error?: string;
    agent_chain_log?: Array<{
        agent_name: string;
        reasoning: string;
        summation: string;
    }>;
    agent_chain_reasoning?: string;
    final_answer_summary?: string;
    final_user_answer?: string;
}

interface AnswerChatProps {
    response?: Response;
    isLoading?: boolean;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-self: flex-start;
    max-width: 80%;
`;

const MessageHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const AgentLogo = styled.img`
    width: 32px;
    height: 32px;
`;

const MessageContent = styled.div`
    margin-left: 44px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 63px;
    padding: 16px 24px;
    color: ${props => props.theme.colors.textSecondary};
    margin-left: 44px;
`;

const LoadingText = styled.span`
    font-size: 0.9rem;
    opacity: 0.8;
`;

const ErrorMessage = styled.div`
    color: ${props => props.theme.colors.error};
    padding: 12px;
    border-radius: 6px;
    background: ${props => props.theme.colors.error}11;
    margin-left: 44px;
`;

export const AnswerChat: React.FC<AnswerChatProps> = ({response, isLoading = false}) => {
    return (
        <Container>
            <MessageHeader>
                <AgentLogo src={reactLogo} alt="Agent"/>
                {isLoading && <LoadingDots/>}
            </MessageHeader>

            {isLoading ? (
                <LoadingContainer>
                    <LoadingText>에이전트가 응답을 생성하고 있습니다...</LoadingText>
                </LoadingContainer>
            ) : response && (
                <MessageContent>
                    {response.error ? (
                        <ErrorMessage>{response.error}</ErrorMessage>
                    ) : (
                        <>
                            {response.agent_chain_log && response.agent_chain_log.length > 0 && (
                                <AgentChainLog
                                    log={response.agent_chain_log}
                                    reasoning={response.agent_chain_reasoning || '실행 계획이 없습니다.'} // 기본값 제공
                                />
                            )}
                            {response.final_answer_summary && (
                                <SummaryDisplay summary={response.final_answer_summary}/>
                            )}
                            {response.final_user_answer && (
                                <FinalAnswerDisplay answer={response.final_user_answer}/>
                            )}
                        </>
                    )}
                </MessageContent>
            )}
        </Container>
    );
};

export default AnswerChat;