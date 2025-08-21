import {AgentChainPlan, AgentResult, AgentTask, FinalOutput} from '../../application/types.js';
import {AgentRegistry} from '../../infra/mcp/AgentRegistry.js';
import {GeminiClient} from '../../infra/mcp/impl/GeminiClient.js';
import {PromptFactory} from '../../infra/utils/PromptFatory.js';
import log from '../../infra/utils/Logger.js';
import {ConversationHistory} from './ConversationHistory.js';
import {ResponseNotifier} from '../../infra/communication/index.js';

export class ChainExecutor {
    private geminiClient: GeminiClient;

    constructor(
        private agentRegistry: AgentRegistry,
        private history: ConversationHistory
    ) {
        this.geminiClient = GeminiClient.getInstance();
    }

    async execute(userPrompt: string, plan: AgentChainPlan, responseNotifier: ResponseNotifier<FinalOutput>): Promise<FinalOutput> {
        log.info('Phase 2: 에이전트 체인 실행 시작...', 'SYSTEM');

        // 초기 상태 생성 - 모든 에이전트의 기본 정보를 포함
        const initialLogs = plan.steps ? plan.steps.flatMap(step =>
            step.calls.map(call => ({
                agent_name: this.agentRegistry.get(call.agent_id).name,
                reasoning: call.reasoning,
                summation: ''  // 실행 전이므로 빈 문자열
            }))
        ) : [];

        const output: FinalOutput = {
            agent_chain_reasoning: plan.reasoning,
            agent_chain_log: initialLogs,
            is_complete: false
        };
        await responseNotifier.notify(output);

        const agentChainResults: AgentResult[] = [];
        let lastStepFullOutput: string = "";

        if (plan.steps) {
            // 각 단계별 실행
            for (const step of plan.steps) {
                const stepResults = await this.executeStep(step, lastStepFullOutput, output, responseNotifier);
                agentChainResults.push(...stepResults);
                lastStepFullOutput += "\n\n---\n\n" + stepResults.map(r => r.raw).join('\n\n---\n\n');
                await responseNotifier.notify(output);
            }
        }

        // 최종 답변 생성
        const finalAnswer = await this.generateFinalAnswer(userPrompt, agentChainResults);

        // 최종 결과 업데이트
        output.final_user_answer = finalAnswer;
        output.is_complete = true;

        await responseNotifier.notify(output);

        // 대화 이력 업데이트
        this.history.updateHistory(userPrompt, output);

        return output;
    }

    private async executeStep(
        step: AgentChainPlan['steps'][0],
        previousOutput: string,
        output: FinalOutput,
        responseNotifier: ResponseNotifier<FinalOutput>
    ): Promise<AgentResult[]> {
        log.info(`Step ${step.step} 실행`, 'SYSTEM');
        const results: AgentResult[] = [];
        const agentsLog = output.agent_chain_log;

        for (const call of step.calls) {
            const result = await this.executeAgentCall(call, step.requires_context, previousOutput);
            results.push(result);

            // agent_chain_log에서 해당 에이전트의 summation을 업데이트
            const agentLogIndex = agentsLog.findIndex(log =>
                log.agent_name === this.agentRegistry.get(call.agent_id).name
            );

            if (agentLogIndex !== -1) {
                agentsLog[agentLogIndex].summation = result.summation ? result.summation : result.raw;
                await responseNotifier.notify(output);
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

        try {
            const agent = this.agentRegistry.get(call.agent_id);

            const result = await agent.sendPrompt(
                {
                    prompt: PromptFactory.taskPrompt(
                        taskPayload.new_task,
                        taskPayload.hub_context,
                        previousOutput
                    )
                }
            );

            return {
                raw: result.raw,
                summation: result.summation
            };
        } catch (error) {
            log.error(`에이전트 ${call.agent_id} 호출 실패`, 'SYSTEM', {error});
            throw error;
        }
    }

    private async generateFinalAnswer(userPrompt: string, results: AgentResult[]): Promise<string> {
        log.info('최종 답변 종합 시작...', 'SYSTEM');

        const finalPrompt = PromptFactory.finalAnswerPrompt(userPrompt, results);
        return await this.geminiClient.sendPrompt({
            prompt: finalPrompt
        });
    }
}
