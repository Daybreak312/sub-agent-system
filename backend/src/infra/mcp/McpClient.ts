export interface McpClient {

    initialize(): Promise<void>;

    sendPrompt(prompt: string, modelName?: string): Promise<string>;
}
