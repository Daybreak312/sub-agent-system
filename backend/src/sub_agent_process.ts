// sub_agent_process.ts

import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {generateText, initializeGeminiClient} from './infra/mcp/impl/GeminiClient.js';
import type {AgentTask, AgentResult} from './application/types.js';
import {getTaskPrompt} from './infra/utils/PromptFatory.js';
import log from './infra/utils/Logger.js';
import {jsonUtils} from './infra/utils/JsonUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXIT_CODES = {
    NORMAL: 0,
    ERROR: 1
};

let agentConfig: any;
let agentSystemPrompt: string;

// --- 메인 작업 처리 함수 ---
async function handleTask(payload: AgentTask) {
    const {new_task, hub_context} = payload;
    log.info(`작업 수신`, 'AGENT', {agentId: agentConfig.id});

    try {
        const taskPrompt = getTaskPrompt(agentSystemPrompt, new_task, hub_context);
        const llmResponseString = await generateText(taskPrompt);
        const parsedResponse = jsonUtils.parse<AgentResult>(llmResponseString, `에이전트 ${agentConfig.id}의 LLM 응답`);

        process.send?.({
            type: 'task_result',
            payload: parsedResponse
        });
    } catch (error) {
        log.error(`작업 처리 실패`, 'AGENT', {
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

        if (!process.argv[2]) {
            throw new Error("Agent configuration not provided");
        }

        agentConfig = jsonUtils.parse(process.argv[2], "에이전트 설정");
        const contextFilePath = path.join(__dirname, '..', 'contexts', `${agentConfig.id}.md`);

        if (!fs.existsSync(contextFilePath)) {
            log.warn(`컨텍스트 파일 없음, 기본 컨텍스트 생성`, 'AGENT');
            fs.mkdirSync(path.dirname(contextFilePath), {recursive: true});
            const defaultContent = `# Role: ${agentConfig.name}\n\nThis agent's prompt has not been defined yet.`;
            fs.writeFileSync(contextFilePath, defaultContent);
            agentSystemPrompt = defaultContent;
        } else {
            agentSystemPrompt = fs.readFileSync(contextFilePath, 'utf-8');
        }

        process.on('message', (message: any) => {
            if (message.type === 'task') handleTask(message.payload);
        });

        process.send?.({status: 'ready'});
        log.info(`초기화 완료`, 'AGENT');
    } catch (error) {
        log.error(`초기화 실패`, 'AGENT', {error});
        process.exit(EXIT_CODES.ERROR);
    }
}

// --- 전역 예외 처리 ---
process.on('uncaughtException', (error) => {
    log.error(`처리되지 않은 예외`, 'AGENT', {error});
    process.exit(EXIT_CODES.ERROR);
});

// --- 프로세스 시작 ---
initialize();
