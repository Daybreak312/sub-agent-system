import type { ChildProcess } from 'child_process';

export interface AgentInfo {
    process: ChildProcess;
    config: AgentConfig;
}

export interface AgentConfig {
    id: string;
    name: string;
    description: string;
    context_file: string;
}
