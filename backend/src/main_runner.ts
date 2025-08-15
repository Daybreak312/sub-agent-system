// main_runner.ts
// 역할: 에이전트 시스템의 컨트롤 타워. 에이전트 생명주기 관리 및 작업 오케스트레이션 담당.

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import yaml from 'js-yaml';
import {fork, ChildProcess} from 'child_process';
import {generateText} from './gemini_client.js';
import type {AgentTask, AgentResult, AgentChainPlan, FinalOutput, AgentChainLogEntry} from './types.js';
import {AgentError, NotFoundError} from './errors/AppError.js';
import log from './utils/logger.js';
import { json } from './utils/json.js';

// ES 모듈에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 시스템 상태 관리 ---
const agentRegistry = new Map<string, { process: ChildProcess, status: string, config: any }>();
let hubConversationHistory: string = "";

// --- Public API (server.ts에서 호출) ---

export async function initializeSystem() {
    try {
        log.info('시스템 초기화를 시작합니다...', 'SYSTEM');
        const configPath = path.join(__dirname, '..', 'agents.yml');

        if (!fs.existsSync(configPath)) {
            log.error('Agent configuration file not found', 'SYSTEM', { configPath });
            throw new NotFoundError('Agent configuration file not found');
        }

        const config = yaml.load(fs.readFileSync(configPath, 'utf-8')) as any;
        const { sub_agents } = config;

        if (!sub_agents || !Array.isArray(sub_agents)) {
            log.error('Invalid agent configuration format', 'SYSTEM', { config });
            throw new AgentError('Invalid agent configuration format');
        }

        const allSubAgentMembers = sub_agents.flatMap((group: any) => group.members);
        allSubAgentMembers.forEach(startSubAgent);

        await new Promise(resolve => setTimeout(resolve, 2000));
        log.info('모든 에이전트가 준비되었습니다.', 'SYSTEM');
    } catch (error) {
        if (error instanceof Error) {
            log.error(`System initialization failed: ${error.message}`, 'SYSTEM', {error});
            throw new AgentError(`System initialization failed: ${error.message}`);
        }
        throw error;
    }
}

export async function handleUserPrompt(user_prompt: string): Promise<FinalOutput> {
    try {
        const plan = await phase1_get_agent_chain_plan(user_prompt);
        const finalOutput = await phase2_execute_plan_and_get_final_answer(user_prompt, plan);
        updateHistoryAndLog(user_prompt, finalOutput);
        return finalOutput;
    } catch (error) {
        if (error instanceof Error) {
            throw new AgentError(`Failed to process user prompt: ${error.message}`);
        }
        throw error;
    }
}

export function getSystemStatus() {
    try {
        return Array.from(agentRegistry.entries()).map(([id, data]) => ({
            id,
            status: data.status,
            pid: data.process?.pid
        }));
    } catch (error) {
        if (error instanceof Error) {
            throw new AgentError(`Failed to get system status: ${error.message}`);
        }
        throw error;
    }
}

export function stopAgent(agentId: string) {
    try {
        const agent = agentRegistry.get(agentId);
        if (!agent) {
            log.error(`Agent not found: ${agentId}`, 'AGENT', {agentId});
            throw new NotFoundError(`Agent with id ${agentId} not found`);
        }

        log.info(`Stopping agent: ${agentId}`, 'AGENT', {agentId});
        agent.process.kill();
        agent.status = 'stopped';
        agentRegistry.delete(agentId);

        log.info(`Agent stopped successfully: ${agentId}`, 'AGENT', {agentId});
        return {success: true, message: `Agent ${agentId} stopped successfully`};
    } catch (error) {
        if (error instanceof Error) {
            log.error(`Failed to stop agent: ${error.message}`, 'AGENT', {agentId, error});
            throw new AgentError(`Failed to stop agent: ${error.message}`);
        }
        throw error;
    }
}

// --- 내부 로직 함수들 ---

function startSubAgent(agentConfig: any) {
    const agentId = agentConfig.id;
    log.info(`서브 에이전트 [${agentId}] 프로세스를 시작합니다...`, 'AGENT', { agentId });

    const scriptPath = path.join(__dirname, 'sub_agent_process.js');
    const childProcess = fork(scriptPath, [json.stringify(agentConfig, '에이전트 설정')], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    agentRegistry.set(agentId, {
        process: childProcess,
        status: 'starting',
        config: agentConfig,
    });

    childProcess.on('message', (msg: any) => {
        if (msg.status === 'ready') {
            log.info(`서브 에이전트 [${agentId}]가 준비되었습니다.`, 'AGENT', { agentId });
            agentRegistry.get(agentId)!.status = 'running';
        }
    });

    childProcess.on('exit', (code) => handleSubAgentExit(agentId, code));
}

function handleSubAgentExit(agentId: string, code: number | null) {
    log.error(`서브 에이전트 [${agentId}]가 종료 코드 ${code}로 중단되었습니다.`, 'AGENT', {agentId, exitCode: code});
    const agentInfo = agentRegistry.get(agentId)!;
    agentInfo.status = 'crashed';
    // TODO: Implement fault tolerance logic based on exit code
}

async function phase1_get_agent_chain_plan(user_prompt: string): Promise<AgentChainPlan> {
    log.info('Phase 1: 에이전트 체인 계획 수립 시작...', 'SYSTEM');
    const available_agents = Array.from(agentRegistry.values()).map(agent => ({
        id: agent.config.id,
        description: agent.config.description
    }));

    const planning_prompt = `
    당신은 여러 전문가 에이전트들을 지휘하는 마스터 오케스트레이터입니다.
    사용자의 요청을 해결하기 위한 최적의 '에이전트 체인 계획'을 아래의 JSON 형식으로 수립해야 합니다.

    --- 사용 가능한 에이전트 목록 ---
    ${JSON.stringify(available_agents, null, 2)}

    --- 사용자의 요청 ---
    "${user_prompt}"

    --- 출력 규칙 ---
    반드시 아래의 JSON 형식으로 출력해야 합니다.
    
    {
      "reasoning" : string; // 이 계획을 수립한 전반적인 이유 (클라이언트 표시용)
      "steps": [
        {
          "step": number; // 실행 순서 (0, 1, 2...), 각 단계는 바로 이전 단계의 결과 전체를 참조 가능
          "calls": [
            {
              "agent_id": string; // 호출할 에이전트의 ID
              "reasoning": string; // 이 에이전트를 호출하는 이유 (클라이언트 표시용)
              "task": string; // 이 에이전트에게 부여된 구체적인 작업 내용
            }
          ]; // 이 단계에서 병렬로 호출될 에이전트 목록
          "requires_context": boolean; // 이 단계의 에이전트들이 이전의 대화 문맥을 필요로 하는지 여부
        }
      ]
    }
  `;

    const plan_json_string = await generateText(planning_prompt);
    const plan = json.parse<AgentChainPlan>(plan_json_string, '에이전트 체인 계획');

    log.info('Phase 1: 계획 수립 완료', 'SYSTEM', {
        numberOfSteps: plan.steps.length,
        reasoning: plan.reasoning
    });

    return plan;
}

async function phase2_execute_plan_and_get_final_answer(user_prompt: string, plan: AgentChainPlan): Promise<FinalOutput> {
    log.info('Phase 2: 에이전트 체인 실행 시작...', 'SYSTEM');
    const agent_chain_results: AgentResult[] = [];
    const agent_chain_log: AgentChainLogEntry[] = [];
    let last_step_full_output: string = "";

    for (const step of plan.steps) {
        log.info(`Step ${step.step} 실행`, 'SYSTEM', {
            step: step.step,
            numberOfCalls: step.calls.length
        });

        const agent_chain_step_results: AgentResult[] = [];

        for (const call of step.calls) {
            log.info(`에이전트 호출`, 'SYSTEM', {
                agentId: call.agent_id,
                reasoning: call.reasoning
            });

            const taskPayload: AgentTask = {
                new_task: call.task,
                hub_context: step.requires_context ? hubConversationHistory : undefined,
            };

            if (last_step_full_output) {
                taskPayload.new_task += `\n\n--- 이전 단계 결과물 ---\n${last_step_full_output}`;
            }

            const result = await requestToSubAgent(call.agent_id, taskPayload);
            agent_chain_step_results.push(result);
            agent_chain_results.push(result);

            agent_chain_log.push({
                agent_name: agentRegistry.get(call.agent_id)?.config.name || call.agent_id,
                reasoning: call.reasoning,
                summation: result.summation,
            });

            log.info(`에이전트 응답 수신`, 'SYSTEM', {
                agentId: call.agent_id,
                summationLength: result.summation.length
            });
        }

        last_step_full_output = agent_chain_step_results
            .map((it) => it.raw)
            .join('\n\n---\n\n');
    }

    log.info('모든 체인 실행 완료. 최종 답변 종합 시작...', 'SYSTEM');

    const synthesis_prompt = `
    당신은 마스터 오케스트레이터입니다.
    아래는 사용자의 요청을 처리하기 위해 실행한 에이전트 체인의 결과입니다.
    이 모든 결과를 종합하여, 사용자를 위한 최종적이고 통합된 답변을 아래 JSON 형식에 맞추어 생성해주세요.

    --- 사용자의 요청 ---
    "${user_prompt}"
 
    --- 답변 형식 ---
    {
        "final_user_answer": string // 최종 답변",
        "final_answer_summary": "최종 답변의 핵심 요약을 5줄로 작성, 필요에 따라 능동적으로 줄 수 조정"
    }

    --- 에이전트 실행 결과 ---
    ${json.stringify({ agent_chain_results }, '체인 결과')}
  `;

    const final_answer = json.parse<FinalOutput>(
        await generateText(synthesis_prompt),
        '최종 답변'
    );
    final_answer.agent_chain_reasoning = plan.reasoning;
    final_answer.agent_chain_log = agent_chain_log;

    log.info('최종 답변 생성 완료', 'SYSTEM', {
        answerLength: final_answer.final_user_answer.length,
        summaryLength: final_answer.final_answer_summary.length
    });

    return final_answer;
}

function requestToSubAgent(agentId: string, payload: AgentTask): Promise<AgentResult> {
    return new Promise((resolve, reject) => {
        const agentInfo = agentRegistry.get(agentId);
        if (!agentInfo || agentInfo.status !== 'running') {
            const error = new Error(`Agent ${agentId} is not running.`);
            log.error('에이전트 상태 오류', 'SYSTEM', { agentId, status: agentInfo?.status });
            return reject(error);
        }

        const {process} = agentInfo;
        const timeout = 180000; // 180초 타임아웃

        const timer = setTimeout(() => {
            process.removeListener('message', listener);
            const error = new Error(`Agent ${agentId} timed out after ${timeout}ms.`);
            log.error('에이전트 타임아웃', 'SYSTEM', { agentId, timeout });
            reject(error);
        }, timeout);

        const listener = (message: any) => {
            if (message.type === 'task_result') {
                clearTimeout(timer);
                process.removeListener('message', listener);
                resolve(message.payload);
            } else if (message.type === 'task_error') {
                clearTimeout(timer);
                process.removeListener('message', listener);
                const error = new Error(message.payload.message);
                log.error('에이전트 작업 오류', 'SYSTEM', {
                    agentId,
                    error: message.payload
                });
                reject(error);
            }
        };

        process.on('message', listener);
        process.send({type: 'task', payload});
    });
}

function updateHistoryAndLog(user_prompt: string, output: FinalOutput) {
    const logSummaries = output.agent_chain_log.map(log => `[${log.agent_name} 요약]: ${log.summation}`).join('\n');
    hubConversationHistory += `\n\nuser: ${user_prompt}\nassistant: ${logSummaries}\n[최종 답변 요약]: ${output.final_answer_summary}`;

    // 대화 내용을 파일에 저장
    try {
        fs.appendFileSync('./conversation.log',
            json.stringify({
                timestamp: new Date().toISOString(),
                userInput: user_prompt,
                output
            }, '대화 내용 저장') + '\n'
        );

        log.debug('대화 내용 저장 완료', 'SYSTEM', {
            historyLength: hubConversationHistory.length
        });
    } catch (error) {
        log.error('대화 내용 저장 실패', 'SYSTEM', { error });
    }
}
