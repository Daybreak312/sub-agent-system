import {AgentChainPlan} from '../../application/types.js';
import {AgentRegistry} from '../../infra/mcp/AgentRegistry.js';
import {generateText} from '../../infra/mcp/GeminiClient.js';
import {jsonUtils} from '../../infra/utils/JsonUtils.js';
import {getPlanPrompt} from '../../infra/utils/PromptFatory.js';
import log from '../../infra/utils/Logger.js';

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
        const plan = jsonUtils.parse<AgentChainPlan>(plan_json_string, '에이전트 체인 계획');

        log.info('Phase 1: 계획 수립 완료', 'SYSTEM', {
            numberOfSteps: plan.steps.length,
            reasoning: plan.reasoning
        });

        return plan;
    }
}
