import {AgentInfo, AgentConfig} from './types.js';
import {NotFoundError} from '../errors/AppError.js';
import log from '../utils/logger.js';

export class AgentRegistry {
    private agents: Map<string, AgentInfo>;

    constructor() {
        this.agents = new Map<string, AgentInfo>();
    }

    register(agentId: string, info: AgentInfo): void {
        this.agents = this.agents.set(agentId, info);
        log.info(`에이전트 등록: ${agentId}`, 'AGENT');
    }

    get(agentId: string): AgentInfo {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new NotFoundError(`Agent ${agentId} not found`);
        }
        return agent;
    }

    getAllAgents(): Array<[string, AgentInfo]> {
        if (this.agents.size === 0) {
            throw new NotFoundError('No agents registered');
        }
        return Array.from(this.agents.entries());
    }

    remove(agentId: string): void {
        this.agents.delete(agentId);
        log.info(`에이전트 제거: ${agentId}`, 'AGENT');
    }

    getAvailableAgents(): Array<{ id: string; description: string }> {
        return this.getAllAgents().map(([_, data]) => ({
            id: data.config.id,
            description: data.config.description
        }));
    }
}
