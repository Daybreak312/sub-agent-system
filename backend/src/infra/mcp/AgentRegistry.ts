import {InternalServerError, NotFoundError} from '../errors/AppError.js';
import log from '../utils/Logger.js';
import {Agent} from "./Agent.js";

/**
 * 에이전트들을 확보, 격리, 보호하기 위한 저장소.
 *
 */
export class AgentRegistry {
    private readonly agents = new Map<string, Agent>();

    register(agentId: string, info: Agent): void {
        if (agentId != info.id) {
            throw new Error("Agent ID mismatch on registering.")
        }

        this.agents.set(agentId, info);
        log.info(`Registered agent: ${agentId}`, 'AGENT');
    }

    get(agentId: string): Agent {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new NotFoundError(`Agent ${agentId} not found`);
        }
        return agent;
    }

    getAllAgents(): Array<[string, Agent]> {
        if (this.agents.size === 0) {
            throw new NotFoundError('No agents registered');
        }
        return Array.from(this.agents.entries());
    }

    getAvailableAgents(): Array<{ id: string; description: string }> {
        return this.getAllAgents().map(([_, data]) => ({
            id: data.id,
            description: data.description
        }));
    }

    remove(agentId: string): void {
        this.agents.delete(agentId);
        log.info(`에이전트 제거: ${agentId}`, 'AGENT');
    }
}
