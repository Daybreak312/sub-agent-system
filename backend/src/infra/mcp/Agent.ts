import {PromptProps} from "./McpClient.js";
import {Lifecycle} from "../utils/Lifecycle.js";

/**
 * 특정한 역할을 가진 에이전트.
 *
 * @see AgentsConfig
 */
export interface Agent extends Lifecycle {
    id: string;
    name: string;
    description: string;
    systemPrompt: string

    initialize(): Promise<void>;

    sendPrompt(props: PromptProps): Promise<string>;

    finalize(): Promise<void>;
}