import {NotFoundError} from '../errors/AppError.js';
import log from '../utils/Logger.js';
import {Agent} from "./Agent.js";

/**
 * 에이전트들을 확보, 격리, 보호하기 위한 저장소.
 *
 */
export class AgentRegistry {
    private readonly agents = new Map<string, Agent>();

    /**
     * 에이전트를 레지스트리에 확보합니다.
     *
     * @param agentId {@linkcode Agent.id}
     * @param agent {@linkcode Agent}
     */
    register(agentId: string, agent: Agent): void {
        if (agentId != agent.id) {
            throw new Error("Agent ID mismatch on registering.")
        }

        this.agents.set(agentId, agent);
        log.info(`Registered agent: ${agentId}`, 'AGENT');
    }

    /**
     * 에이전트 아이디를 기반으로 레지스트리에서 에이전트를 불러옵니다.
     *
     * @param agentId {@linkcode Agent.id}
     */
    get(agentId: string): Agent {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new NotFoundError(`Agent ${agentId} not found`);
        }
        return agent;
    }

    /**
     * 모든 에이전트를 불러옵니다.
     */
    getAllAgents(): Array<[string, Agent]> {
        if (this.agents.size === 0) {
            throw new NotFoundError('No agents registered');
        }
        return Array.from(this.agents.entries());
    }

    /**
     * 사용 가능한 에이전트들의 정보를 불러옵니다.
     */
    getAvailableAgents(): Array<{ id: string; description: string }> {
        return this.getAllAgents().map(([_, data]) => ({
            id: data.id,
            description: data.description
        }));
    }

    /**
     * 에이전트 아이디를 기반으로 레지스트리에서 에이전트를 제거합니다.
     *
     * @param agentId {@linkcode Agent.id}
     */
    remove(agentId: string): void {
        this.agents.delete(agentId);
        log.info(`에이전트 제거: ${agentId}`, 'AGENT');
    }
}
