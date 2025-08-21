import {AgentChainPlan} from '../../application/types.js';
import {AgentRegistry} from '../../infra/mcp/AgentRegistry.js';
import {GeminiClient} from '../../infra/mcp/impl/GeminiClient.js';
import {jsonUtils} from '../../infra/utils/JsonUtils.js';
import {PromptFactory} from '../../infra/utils/PromptFatory.js';
import log from '../../infra/utils/Logger.js';

export class ChainPlanner {

    private geminiClient: GeminiClient = GeminiClient.getInstance();

    constructor(
        private agentRegistry: AgentRegistry
    ) {
    }

    async createPlan(userPrompt: string): Promise<AgentChainPlan> {
        log.info('Phase 1: 에이전트 체인 계획 수립 시작...', 'SYSTEM');
        const availableAgents = this.agentRegistry.getAvailableAgents();

        const prompt = PromptFactory.planPrompt(availableAgents, userPrompt);
        const result = await this.geminiClient.sendPrompt({prompt});

        const plan = jsonUtils.parse<AgentChainPlan>(result, '에이전트 체인 계획');

        log.info('Phase 1: 계획 수립 완료', 'SYSTEM');

        return plan;
    }
}
