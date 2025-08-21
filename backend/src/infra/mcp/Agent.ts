import {PromptProps} from "./McpClient.js";
import {Lifecycle} from "../utils/Lifecycle.js";
import {AgentConfig} from "./AgentsConfig.js";

export interface AgentProps {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
}

/**
 * 특정한 역할을 가진 에이전트.
 *
 * @see AgentsConfig
 */
export interface Agent extends Lifecycle, AgentConfig {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;

    initialize(): Promise<void>;

    sendPrompt(props: PromptProps): Promise<AgentResult>;

    finalize(): Promise<void>;
}

/**
 * 해당 시스템의 에이전트 표준 응답.
 */
export interface AgentResult {

    /**
     * 전체 답변.
     */
    raw: string,

    /**
     * 답변의 요약.
     */
    summation: string
}