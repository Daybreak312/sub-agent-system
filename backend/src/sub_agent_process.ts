// sub_agent_process.ts

import net from 'net';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {generateText, initializeGeminiClient} from './gemini_client.js';
import type {AgentTask, AgentResult} from './types.js';
import log from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXIT_CODES = {
    NORMAL: 0,
    UNCAUGHT_EXCEPTION: 1,
    PORT_IN_USE: 10,
    CORE_INIT_FAILED: 20, // This might be deprecated as we removed CoreInstance from here
    INVALID_CONFIG: 31,
};

let agentConfig: any;
let agentSystemPrompt: string;

// --- 메인 작업 처리 함수 ---
async function handleTask(payload: AgentTask) {
    const {new_task, hub_context} = payload;
    log.info(`[${agentConfig.id}] 작업 수신: ${new_task}`, 'AGENT', { agentId: agentConfig.id });

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

        // 3. LLM의 응답을 파싱하고 타입에 맞춰 반환
        const parsedResponse: AgentResult = JSON.parse(llmResponseString);

        process.send?.({
            type: 'task_result',
            payload: parsedResponse
        });
    } catch (error) {
        log.error(`[${agentConfig.id}] 작업 처리 실패`, 'AGENT', {
            agentId: agentConfig.id,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        process.send?.({
            type: 'task_error',
            payload: {
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            }
        });
    }
}

// --- 초기화 로직 ---
async function initialize() {
    try {
        await initializeGeminiClient();

        if (!process.argv[2]) throw new Error("Agent configuration not provided.");
        agentConfig = JSON.parse(process.argv[2]);

        const contextFilePath = path.join(__dirname, '..', 'contexts', `${agentConfig.id}.md`);
        if (!fs.existsSync(contextFilePath)) {
            log.warn(`컨텍스트 파일이 존재하지 않아 빈 파일을 생성합니다`, 'AGENT');
            fs.mkdirSync(path.dirname(contextFilePath), {recursive: true});
            const defaultContent = `# Role: ${agentConfig.name}\n\nThis agent's prompt has not been defined yet.`;
            fs.writeFileSync(contextFilePath, defaultContent);
            agentSystemPrompt = defaultContent;
        } else {
            agentSystemPrompt = fs.readFileSync(contextFilePath, 'utf-8');
        }

        try {
            const healthCheckServer = await startHealthCheckServer(agentConfig.id, agentConfig.health_check_port);
            healthCheckServer.on('connection', () => {
            });
        } catch (error: any) {
            if (error.code === 'EADDRINUSE') {
                log.error(`포트 ${agentConfig.health_check_port}가 이미 사용 중입니다`, 'AGENT');
                process.exit(EXIT_CODES.PORT_IN_USE);
            }
            throw error;
        }

        process.on('message', (message: any) => {
            if (message.type === 'task') handleTask(message.payload);
        });

        process.send?.({status: 'ready', id: agentConfig.id});
        log.info(`초기화 완료`, 'AGENT');

    } catch (error) {
        log.error(`초기화 중 오류 발생`, 'AGENT', { error });
        process.exit(EXIT_CODES.INVALID_CONFIG);
    }
}

// --- 헬스체크 서버 구현 ---
function startHealthCheckServer(agentId: string, port: number): Promise<net.Server> {
    return new Promise((resolve, reject) => {
        const server = net.createServer((socket) => {
            socket.write(JSON.stringify({pong: agentId}));
            socket.end();
        });
        server.on('error', reject);
        server.listen(port, () => {
            log.info(`[${agentId}] 헬스체크 서버가 포트 ${port}에서 대기 중입니다.`, 'AGENT', { agentId, port });
            resolve(server);
        });
    });
}

// --- 전역 예외 처리 ---
process.on('uncaughtException', (error, origin) => {
    log.error(`처리되지 않은 예외 발생`, 'AGENT', { error, origin });
    process.exit(EXIT_CODES.UNCAUGHT_EXCEPTION);
});

// --- 프로세스 시작 ---
initialize();
