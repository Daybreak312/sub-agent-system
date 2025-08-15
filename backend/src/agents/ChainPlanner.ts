import {AgentChainPlan} from '../types.js';
import {AgentRegistry} from './AgentRegistry.js';
import {generateText} from '../gemini_client.js';
import {json} from '../utils/json.js';
import {getPlanPrompt} from './PromptFatory.js';
import log from '../utils/logger.js';

export class ChainPlanner {
    constructor(
        private agentRegistry: AgentRegistry
    ) {
    }

    async createPlan(userPrompt: string): Promise<AgentChainPlan> {
        log.info('Phase 1: 에이전트 체인 계획 수립 시작...', 'SYSTEM');
        const availableAgents = this.agentRegistry.getAvailableAgents();

        const planPrompt = getPlanPrompt(availableAgents, userPrompt);
        const plan_json_string = await generateText(planPrompt);
        const plan = json.parse<AgentChainPlan>(plan_json_string, '에이전트 체인 계획');

        log.info('Phase 1: 계획 수립 완료', 'SYSTEM', {
            numberOfSteps: plan.steps.length,
            reasoning: plan.reasoning
        });

        return plan;
    }
}
