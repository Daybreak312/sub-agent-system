import { AgentTask, AgentResult, AgentChainPlan, FinalOutput, AgentChainLogEntry } from '../../application/types.js';
import { AgentRegistry } from '../../infra/mcp/AgentRegistry.js';
import { generateText } from '../../infra/mcp/GeminiClient.js';
import { jsonUtils } from '../../infra/utils/JsonUtils.js';
import { getFinalAnswerPrompt } from '../../infra/utils/PromptFatory.js';
import log from '../../infra/utils/Logger.js';
import { ConversationHistory } from './ConversationHistory.js';
import EventEmitter from 'events';

export class ChainExecutor {
    private eventEmitter: EventEmitter;

    constructor(
        private agentRegistry: AgentRegistry,
        private history: ConversationHistory
    ) {
        this.eventEmitter = new EventEmitter();
    }

    onProgressUpdate(callback: (output: FinalOutput) => void) {
        this.eventEmitter.on('progress', callback);
    }

    private emitProgress(output: FinalOutput) {
        this.eventEmitter.emit('progress', output);
    }

    async execute(userPrompt: string, plan: AgentChainPlan): Promise<FinalOutput> {
        log.info('Phase 2: 에이전트 체인 실행 시작...', 'SYSTEM');

        // 초기 상태 생성 - 모든 에이전트의 기본 정보를 포함
        const initialLogs = plan.steps.flatMap(step =>
            step.calls.map(call => ({
                agent_name: this.agentRegistry.get(call.agent_id).config.name,
                reasoning: call.reasoning,
                summation: ''  // 실행 전이므로 빈 문자열
            }))
        );

        const output: FinalOutput = {
            agent_chain_reasoning: plan.reasoning,
            agent_chain_log: initialLogs,
            is_complete: false
        };
        this.emitProgress(output);

        const agentChainResults: AgentResult[] = [];
        let lastStepFullOutput: string = "";

        // 각 단계별 실행
        for (const step of plan.steps) {
            const stepResults = await this.executeStep(step, lastStepFullOutput, output.agent_chain_log);
            agentChainResults.push(...stepResults);
            lastStepFullOutput = stepResults.map(r => r.raw).join('\n\n---\n\n');
            this.emitProgress(output);
        }

        // 최종 답변 생성
        const finalAnswer = await this.generateFinalAnswer(userPrompt, agentChainResults);

        // 최종 결과 업데이트
        output.final_user_answer = finalAnswer.final_user_answer;
        output.final_answer_summary = finalAnswer.final_answer_summary;
        output.is_complete = true;
        this.emitProgress(output);

        // 대화 이력 업데이트
        this.history.updateHistory(userPrompt, output);

        return output;
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

            // agent_chain_log에서 해당 에이전트의 summation을 업데이트
            const agentLogIndex = agentChainLog.findIndex(log =>
                log.agent_name === this.agentRegistry.get(call.agent_id).config.name
                && log.reasoning === call.reasoning
            );

            if (agentLogIndex !== -1) {
                agentChainLog[agentLogIndex].summation = result.summation;
            }
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

        const finalPrompt = getFinalAnswerPrompt(userPrompt, results);
        const finalAnswer = jsonUtils.parse<FinalOutput>(
            await generateText(finalPrompt),
            '최종 답변'
        );

        return finalAnswer;
    }
}
