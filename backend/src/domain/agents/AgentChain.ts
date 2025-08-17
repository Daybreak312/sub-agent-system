export interface AgentChainPlan {
    reasoning: string;
    steps: AgentChainStep[];
}

export interface AgentChainStep {
    number: number;
    agents: AgentCall[];
    requiresLastStepResult: boolean;
}

export interface AgentCall {
    number: number;
    id: string;
    task: string;
    reasoning: string;
}

export interface AgentChainResult {
    finalAnswer: string;
    finalAnswerSummary: string;
    agentChainStepsResult: AgentChainStepResult[];
}

export interface AgentChainStepResult {
    number: number;
    agentsResult: AgentCallResult[];
}

export interface AgentCallResult {
    number: number;
    raw: string;
    summation: string;
}