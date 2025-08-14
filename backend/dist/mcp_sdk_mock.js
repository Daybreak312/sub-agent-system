// mcp_sdk_mock.ts
// @modelcontextprotocol/sdk 패키지의 실제 API를 가정하여 만든 가상 SDK입니다.
// 모든 도구의 기반이 될 가상 클래스
export class BaseTool {
    name = '';
    description = '';
    parameterSchema = {};
    async execute(params) {
        throw new Error("execute method not implemented.");
    }
}
// MCP 서버를 시뮬레이션하는 가상 클래스
export class McpServer {
    tools = new Map();
    constructor() {
        console.log("[Mock SDK] McpServer instance created.");
    }
    // 서브 에이전트가 자신의 도구를 등록하는 메소드
    registerTool(tool) {
        this.tools.set(tool.name, tool);
        console.log(`[Mock SDK] Tool '${tool.name}' registered.`);
    }
    // 허브의 요청을 기다리는 리스너 시작
    listen() {
        console.log("[Mock SDK] Server is now listening for tasks...");
        // 실제 구현에서는 IPC나 TCP 리스너가 여기서 시작됩니다.
        return Promise.resolve({ port: 12345 }); // 가상의 성공 응답
    }
}
// Gemini Core 인스턴스를 시뮬레이션하는 가상 클래스
export class CoreInstance {
    constructor(config) {
        console.log('[Mock SDK] CoreInstance created with config:', config.context ? 'context provided' : 'no context');
    }
    // LLM 답변 생성을 시뮬레이션하는 메소드
    async generate(prompt) {
        console.log('[Mock SDK] Generating response for prompt...');
        // 실제로는 여기서 Gemini API를 호출합니다.
        if (prompt.includes("AgentChainPlan")) {
            // 계획 수립 요청에 대한 가짜 JSON 응답
            return JSON.stringify({ overall_reasoning: "...", steps: [] });
        }
        return "Generated answer from LLM.";
    }
    initialize() {
        return Promise.resolve();
    }
}
export function createCoreInstance(config) {
    return new CoreInstance(config);
}
