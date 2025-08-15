import {AgentTask, AgentResult, AgentChainPlan, FinalOutput, AgentChainLogEntry} from '../types.js';
import {AgentRegistry} from './AgentRegistry.js';
import {generateText} from '../gemini_client.js';
import {json} from '../utils/json.js';
import log from '../utils/logger.js';
import {ConversationHistory} from './ConversationHistory.js';

export class ChainExecutor {
    constructor(
        private agentRegistry: AgentRegistry,
        private history: ConversationHistory
    ) {
    }

    async execute(userPrompt: string, plan: AgentChainPlan): Promise<FinalOutput> {
        log.info('Phase 2: 에이전트 체인 실행 시작...', 'SYSTEM');
        const agentChainResults: AgentResult[] = [];
        const agentChainLog: AgentChainLogEntry[] = [];
        let lastStepFullOutput: string = "";

        // 각 단계별 실행
        for (const step of plan.steps) {
            const stepResults = await this.executeStep(step, lastStepFullOutput, agentChainLog);
            agentChainResults.push(...stepResults);
            lastStepFullOutput = stepResults.map(r => r.raw).join('\n\n---\n\n');
        }

        // 최종 답변 생성
        const finalAnswer = await this.generateFinalAnswer(userPrompt, agentChainResults);
        finalAnswer.agent_chain_reasoning = plan.reasoning;
        finalAnswer.agent_chain_log = agentChainLog;

        // 대화 이력 업데이트
        this.history.updateHistory(userPrompt, finalAnswer);

        return finalAnswer;
    }

    private async executeStep(
        step: AgentChainPlan['steps'][0],
        previousOutput: string,
        agentChainLog: AgentChainLogEntry[]
    ): Promise<AgentResult[]> {
        log.info(`Step ${step.step} 실행`, 'SYSTEM');

        const results: AgentResult[] = [];

        for (const call of step.calls) {
            const result = await this.executeAgentCall(call, step.requires_context, previousOutput);
            results.push(result);

            agentChainLog.push({
                agent_name: this.agentRegistry.get(call.agent_id).config.name,
                reasoning: call.reasoning,
                summation: result.summation,
            });
        }

        return results;
    }

    private async executeAgentCall(
        call: AgentChainPlan['steps'][0]['calls'][0],
        requiresContext: boolean,
        previousOutput: string
    ): Promise<AgentResult> {
        log.info(`에이전트 호출: ${call.agent_id}`, 'SYSTEM');

        const taskPayload: AgentTask = {
            new_task: call.task,
            hub_context: requiresContext ? this.history.getHistory() : undefined,
        };

        if (previousOutput) {
            taskPayload.new_task += `\n\n--- 이전 단계 결과물 ---\n${previousOutput}`;
        }

        return new Promise((resolve, reject) => {
            const agent = this.agentRegistry.get(call.agent_id);
            const timeout = 180000;

            const timer = setTimeout(() => {
                cleanup();
                reject(new Error(`Agent ${call.agent_id} timed out after ${timeout}ms.`));
            }, timeout);

            const listener = (message: any) => {
                if (message.type === 'task_result') {
                    cleanup();
                    resolve(message.payload);
                } else if (message.type === 'task_error') {
                    cleanup();
                    reject(new Error(message.payload.message));
                }
            };

            const cleanup = () => {
                clearTimeout(timer);
                agent.process.removeListener('message', listener);
            };

            agent.process.on('message', listener);
            agent.process.send({type: 'task', payload: taskPayload});
        });
    }

    private async generateFinalAnswer(userPrompt: string, results: AgentResult[]): Promise<FinalOutput> {
        log.info('최종 답변 종합 시작...', 'SYSTEM');

        const synthesis_prompt = `
            당신은 마스터 오케스트레이터입니다.
            아래는 사용자의 요청을 처리하기 위해 실행한 에이전트 체인의 결과입니다.
            이 모든 결과를 종합하여, 사용자를 위한 최종적이고 통합된 ���변을 아래 JSON 형식에 맞추어 생성해주세요.

            --- 사용자의 요청 ---
            "${userPrompt}"
        
            --- 답변 형식 ---
            {
                "final_user_answer": string // 최종 답변",
                "final_answer_summary": "최종 답변의 핵심 요약을 5줄로 작성"
            }

            --- 에이전트 실행 결과 ---
            ${json.stringify({results}, '체인 결과')}
        `;

        const finalAnswer = json.parse<FinalOutput>(
            await generateText(synthesis_prompt),
            '최종 답변'
        );

        return finalAnswer;
    }
}
