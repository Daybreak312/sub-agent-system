import {AgentChainPlan} from '../types.js';
import {AgentRegistry} from './AgentRegistry.js';
import {generateText} from '../gemini_client.js';
import {json} from '../utils/json.js';
import log from '../utils/logger.js';

export class ChainPlanner {
    constructor(
        private agentRegistry: AgentRegistry
    ) {
    }

    async createPlan(userPrompt: string): Promise<AgentChainPlan> {
        log.info('Phase 1: 에이전트 체인 계획 수립 시작...', 'SYSTEM');
        const availableAgents = this.agentRegistry.getAvailableAgents();

        const planning_prompt = `
            당신은 여러 전문가 에이전트들을 지휘하는 마스터 오케스트레이터입니다.
            사용자의 요청을 해결하기 위한 최적의 '에이전트 체인 계획'을 아래의 JSON 형식으로 수립해야 합니다.

            --- 사용 가능한 에이전트 목록 ---
            ${JSON.stringify(availableAgents, null, 2)}

            --- 사용자의 요청 ---
            "${userPrompt}"

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
}
