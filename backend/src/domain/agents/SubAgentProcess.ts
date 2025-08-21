import {AgentRegistry} from '../../infra/mcp/AgentRegistry.js';
import log from '../../infra/utils/Logger.js';
import {getConfig} from "../../infra/mcp/AgentsConfig.js";
import {GeminiAgent} from "../../infra/mcp/impl/GeminiAgent.js";
import fs from "fs";
import {rootPath} from "../../infra/utils/PathUtils.js";

export class SubAgentProcess {
    constructor(
        private agentRegistry: AgentRegistry
    ) {
    }

    startAgent(): void {
        const config = getConfig();

        for (const entry of config.agents.values()) {
            const agentId = entry.id;

            log.info(`서브 에이전트 [${agentId}] 시작`, 'AGENT');

            const systemPrompt = fs.readFileSync(rootPath(`/contexts/${agentId}.md`));

            this.agentRegistry.register(agentId, new GeminiAgent({
                id: agentId,
                name: entry.name,
                description: entry.description,
                systemPrompt: systemPrompt.toString()
            }));
        }
    }

    stopAgent(agentId: string): void {
        this.agentRegistry.get(agentId).finalize()
            .then(() => {
                this.agentRegistry.remove(agentId);
                log.info(`서브 에이전트 [${agentId}] 중지`, 'AGENT');
            });
    }
}
