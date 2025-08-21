import {AgentRegistry} from '../../infra/mcp/AgentRegistry.js';
import {SubAgentProcess} from './SubAgentProcess.js';
import {ChainPlanner} from './ChainPlanner.js';
import {ChainExecutor} from './ChainExecutor.js';
import {ConversationHistory} from './ConversationHistory.js';
import {FinalOutput} from '../../application/types.js';
import {ResponseNotifier} from '../../infra/communication/index.js';
import log from '../../infra/utils/Logger.js';

export class MainRunner {
    private agentRegistry: AgentRegistry;
    private subAgentProcess: SubAgentProcess;
    private chainPlanner: ChainPlanner;
    private chainExecutor: ChainExecutor;
    private history: ConversationHistory;

    constructor() {
        this.agentRegistry = new AgentRegistry();
        this.subAgentProcess = new SubAgentProcess(this.agentRegistry);
        this.chainPlanner = new ChainPlanner(this.agentRegistry);
        this.history = new ConversationHistory();
        this.chainExecutor = new ChainExecutor(this.agentRegistry, this.history);
    }

    async initialize(): Promise<void> {
        log.info('시스템 초기화 시작', 'SYSTEM');

        this.subAgentProcess.startAgent();

        log.info('시스템 초기화 완료', 'SYSTEM');
    }

    async handleUserPrompt(userPrompt: string, responseNotifier: ResponseNotifier<FinalOutput>): Promise<FinalOutput> {
        const plan = await this.chainPlanner.createPlan(userPrompt);

        // 초기 상태를 바로 알림 (계획 수립 단계)
        const initialOutput: FinalOutput = {
            agent_chain_reasoning: plan.reasoning,
            agent_chain_log: [],
            is_complete: false
        };

        await responseNotifier.notify(initialOutput);

        return await this.chainExecutor.execute(userPrompt, plan, responseNotifier);
    }

    stopAgent(agentId: string) {
        this.subAgentProcess.stopAgent(agentId);
        return {success: true, message: `Agent ${agentId} stopped successfully`};
    }

    async shutdown(): Promise<void> {
        log.info('MainRunner 종료 시작...', 'SYSTEM');

        try {
            // 모든 서브 에이전트 프로세스 종료
            const availableAgents = this.agentRegistry.getAvailableAgents();
            for (const agent of availableAgents) {
                try {
                    log.info(`에이전트 ${agent.id} 종료 중...`, 'SYSTEM');
                    this.subAgentProcess.stopAgent(agent.id);
                } catch (error) {
                    log.warn(`에이전트 ${agent.id} 종료 실패`, 'SYSTEM', {error});
                }
            }

            log.info('모든 서브 에이전트가 종료되었습니다', 'SYSTEM');
        } catch (error) {
            log.error('MainRunner 종료 중 오류 발생', 'SYSTEM', {error});
            throw error;
        }
    }

    getAvailableAgents() {
        return this.agentRegistry.getAvailableAgents();
    }
}
