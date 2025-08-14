// sub_agent_process.ts
import net from 'net';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateText, initializeGeminiClient } from './gemini_client.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXIT_CODES = {
    NORMAL: 0,
    UNCAUGHT_EXCEPTION: 1,
    PORT_IN_USE: 10,
    CORE_INIT_FAILED: 20, // This might be deprecated as we removed CoreInstance from here
    INVALID_CONFIG: 31,
};
let agentConfig;
let agentSystemPrompt;
// --- 메인 작업 처리 함수 ---
async function handleTask(payload) {
    const { new_task, hub_context } = payload;
    console.log(`[${agentConfig.id}] 작업 수신: ${new_task}`);
    try {
        // 1. 최종 프롬프트 구성 (JSON 출력 형식 명시)
        const finalPrompt = `
      ${hub_context ? `--- 허브의 이전 대화 문맥 --- ${hub_context}` : ''}

      --- 나의 역할 및 지침 ---
      ${agentSystemPrompt}
      위 내용을 바탕으로, 반드시 다음 JSON 형식에 맞추어 응답.

      --- 새로운 작업 ---
      ${new_task}

      --- 출력 형식 규칙 ---
      {
        "raw": string // 생성한 전체 답변 내용,
        "summation": string // 생성한 답변의 핵심 내용을 3줄로 요약, 필요에 따라 능동적으로 줄 수 조정
      }
    `;
        // 2. Gemini API를 단 한 번만 호출
        const llmResponseString = await generateText(finalPrompt);
        // 3. LLM의 응답이 유효한 JSON인지 파싱하고, 타입에 맞춰 반환
        // LLM이 JSON 형식 외에 다른 텍스트(예: ```json ... ```)를 포함해서 반환할 경우를 대비한 파싱
        const jsonMatch = llmResponseString.match(/\{.*\}/s);
        if (!jsonMatch) {
            throw new Error("LLM did not return a valid JSON object.");
        }
        const response = JSON.parse(jsonMatch[0]);
        console.debug(response);
        if (process.send) {
            process.send({ type: 'task_result', payload: response });
        }
    }
    catch (error) {
        if (process.send) {
            process.send({ type: 'task_error', payload: { message: error.message, stack: error.stack } });
        }
    }
}
// --- 초기화 로직 ---
async function initialize() {
    await initializeGeminiClient();
    try {
        if (!process.argv[2])
            throw new Error("Agent configuration not provided.");
        agentConfig = JSON.parse(process.argv[2]);
    }
    catch (error) {
        console.error(`[Sub-agent] 설정 정보 파싱 실패. 종료합니다.`, error);
        process.exit(EXIT_CODES.INVALID_CONFIG);
    }
    const contextFilePath = path.join(__dirname, '..', 'contexts', `${agentConfig.id}.md`);
    if (!fs.existsSync(contextFilePath)) {
        console.log(`[${agentConfig.id}] 경고: 컨텍스트 파일이 존재하지 않아 빈 파일을 생성합니다.`);
        fs.mkdirSync(path.dirname(contextFilePath), { recursive: true });
        const defaultContent = `# Role: ${agentConfig.name}\n\nThis agent's prompt has not been defined yet.`;
        fs.writeFileSync(contextFilePath, defaultContent);
        agentSystemPrompt = defaultContent;
    }
    else {
        agentSystemPrompt = fs.readFileSync(contextFilePath, 'utf-8');
    }
    try {
        const healthCheckServer = await startHealthCheckServer(agentConfig.id, agentConfig.health_check_port);
        healthCheckServer.on('connection', () => {
        }); // Keep server object referenced
    }
    catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.error(`[${agentConfig.id}] 헬스체크 포트 ${agentConfig.health_check_port}를 사용할 수 없습니다.`);
            process.exit(EXIT_CODES.PORT_IN_USE);
        }
        else {
            console.error(`[${agentConfig.id}] 헬스체크 서버 시작 실패.`, error);
            process.exit(EXIT_CODES.UNCAUGHT_EXCEPTION);
        }
    }
    process.on('message', (message) => {
        if (message.type === 'task')
            handleTask(message.payload);
    });
    if (process.send) {
        process.send({ status: 'ready', id: agentConfig.id });
    }
    console.log(`[${agentConfig.id}] 초기화 완료. 대기 중...`);
}
// --- 헬스체크 서버 구현 ---
function startHealthCheckServer(agentId, port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer((socket) => {
            socket.write(JSON.stringify({ pong: agentId }));
            socket.end();
        });
        server.on('error', reject);
        server.listen(port, () => {
            console.log(`[${agentId}] 헬스체크 서버가 포트 ${port}에서 대기 중입니다.`);
            resolve(server);
        });
    });
}
// --- 전역 예외 처리 ---
process.on('uncaughtException', (error, origin) => {
    const agentId = agentConfig ? agentConfig.id : 'uninitialized';
    console.error(`[${agentId}] 처리되지 않은 예외 발생:`, origin, '오류:', error);
    process.exit(EXIT_CODES.UNCAUGHT_EXCEPTION);
});
// --- 프로세스 시작 ---
initialize();
