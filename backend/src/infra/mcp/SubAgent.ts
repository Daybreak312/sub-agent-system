import {AgentInfo} from "./AgentsConfig.js";
import {McpClient} from "./McpClient.js";

export interface SubAgent extends AgentInfo {
    id: string;
    name: string;
    description: string;
    client: McpClient;
}