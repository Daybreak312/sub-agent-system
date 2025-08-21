import {Agent, AgentProps, AgentResult} from "../Agent.js";
import {PromptProps} from "../McpClient.js";
import {GeminiClient} from "./GeminiClient.js";
import {jsonUtils} from "../../utils/JsonUtils.js";

export class GeminiAgent implements Agent {
    description: string;
    id: string;
    name: string;
    systemPrompt: string;

    private client = GeminiClient.getInstance();

    constructor(props: AgentProps) {
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.systemPrompt = props.systemPrompt;
    }

    async initialize(): Promise<void> {
    }

    async sendPrompt(props: PromptProps): Promise<AgentResult> {
        props.prompt.withSystemPrompt(this.systemPrompt)
        const result = await this.client.sendPrompt(props);

        return jsonUtils.parse(result, "Parsing agent's result");
    }

    async finalize(): Promise<void> {
    }

}