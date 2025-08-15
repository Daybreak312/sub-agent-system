import fs from "fs";
import {rootPath} from "../utils/PathUtils.js";
import yaml from "js-yaml";

export interface AgentsConfig {
    agents: AgentInfo[];
}

export interface AgentInfo {
    id: string;
    name: string;
    description: string;
}

let configCache: AgentsConfig | undefined = undefined;

export const getConfig = (): AgentsConfig => {
    if (!configCache) {
        try {
            const data = fs.readFileSync(`${rootPath()}/agents.yml`, 'utf8');
            configCache = yaml.load(data) as AgentsConfig;
        } catch (e) {
            throw new Error("Cannot read the agent config file.");
        }
    }

    return configCache;
}

getConfig();