import {fork} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';
import {AgentConfig, AgentInfo} from './types.js';
import {AgentRegistry} from '../../infra/mcp/AgentRegistry.js';
import log from '../../infra/utils/Logger.js';
import {jsonUtils} from '../../infra/utils/JsonUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SubAgentProcess {
    constructor(
        private agentRegistry: AgentRegistry
    ) {
    }

    startAgent(agentConfig: AgentConfig): void {
        const agentId = agentConfig.id;
        log.info(`서브 에이전트 [${agentId}] 시작`, 'AGENT');

        const scriptPath = path.join(__dirname, '..', 'sub_agent_process.js');
        const childProcess = fork(scriptPath, [jsonUtils.stringify(agentConfig, '에이전트 설정')], {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc']
        });

        const agentInfo: AgentInfo = {
            process: childProcess,
            config: agentConfig
        };

        this.agentRegistry.register(agentId, agentInfo);

        childProcess.on('exit', (code) => {
            log.info(`서브 에이전트 [${agentId}] 종료 (코드: ${code})`, 'AGENT');
            this.agentRegistry.remove(agentId);
        });
    }

    stopAgent(agentId: string): void {
        const agent = this.agentRegistry.get(agentId);
        agent.process.kill();
        this.agentRegistry.remove(agentId);
        log.info(`서브 에이전트 [${agentId}] 중지`, 'AGENT');
    }
}
