import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AgentRegistry } from './AgentRegistry.js';
import { SubAgentProcess } from './SubAgentProcess.js';
import { ChainPlanner } from './ChainPlanner.js';
import { ChainExecutor } from './ChainExecutor.js';
import { ConversationHistory } from './ConversationHistory.js';
import { NotFoundError } from '../errors/AppError.js';
import { FinalOutput } from '../types.js';
import log from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ProgressCallback = (progress: FinalOutput) => void;

export class MainRunner {
    private agentRegistry: AgentRegistry;
    private subAgentProcess: SubAgentProcess;
    private chainPlanner: ChainPlanner;
    private chainExecutor: ChainExecutor;
    private history: ConversationHistory;
    private progressCallback?: ProgressCallback;

    constructor() {
        this.agentRegistry = new AgentRegistry();
        this.subAgentProcess = new SubAgentProcess(this.agentRegistry);
        this.chainPlanner = new ChainPlanner(this.agentRegistry);
        this.history = new ConversationHistory();
        this.chainExecutor = new ChainExecutor(this.agentRegistry, this.history);
    }

    onProgressUpdate(callback: ProgressCallback) {
        this.progressCallback = callback;
        this.chainExecutor.onProgressUpdate(callback);
    }

    async initialize(): Promise<void> {
        log.info('시스템 초기화 시작', 'SYSTEM');

        const configPath = path.join(__dirname, '..', '..', 'agents.yml');
        if (!fs.existsSync(configPath)) {
            throw new NotFoundError('Agent configuration file not found');
        }

        const config = yaml.load(fs.readFileSync(configPath, 'utf-8')) as any;
        const allSubAgentMembers = config.sub_agents.flatMap((group: any) => group.members);

        for (const agentConfig of allSubAgentMembers) {
            this.subAgentProcess.startAgent(agentConfig);
        }

        log.info('시스템 초기화 완료', 'SYSTEM');
    }

    async handleUserPrompt(userPrompt: string): Promise<FinalOutput> {
        const plan = await this.chainPlanner.createPlan(userPrompt);

        // 초기 상태를 바로 알림 (계획 수립 단계)
        this.progressCallback?.({
            agent_chain_reasoning: plan.reasoning,
            agent_chain_log: [],
            is_complete: false
        });

        return await this.chainExecutor.execute(userPrompt, plan);
    }

    stopAgent(agentId: string) {
        this.subAgentProcess.stopAgent(agentId);
        return { success: true, message: `Agent ${agentId} stopped successfully` };
    }

    getAvailableAgents() {
        return this.agentRegistry.getAvailableAgents();
    }
}
