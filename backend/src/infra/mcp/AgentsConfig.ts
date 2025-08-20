import fs from "fs";
import {rootPath} from "../utils/PathUtils.js";
import yaml from "js-yaml";

/**
 * 해당 시스템에서 사용할 에이전트들에 관한 설정 정보.
 */
export interface AgentsConfig {
    agents: AgentConfig[];
}

/**
 * 해당 시스템에서 사용할 에이전트들의 개별 설정 정보.
 */
export interface AgentConfig {

    /**
     * 에이전트를 식별하기 위한 아이디 정보.
     */
    id: string;

    /**
     * 클라이언트에서 표시될 에이전트의 이름.
     */
    name: string;

    /**
     * 해당 에이전트를 호출할 때, 어떤 역할을 가지는지 등 대략적인 설명.
     */
    description: string;
}

let configCache: AgentsConfig | undefined = undefined;

/**
 * 설정 정보를 불러옵니다.
 *
 * @fileOverview agents.yml
 */
export const getConfig = (): AgentsConfig => {
    if (!configCache) {
        const fileName = `${rootPath()}/agents.yml`;
        try {
            const data = fs.readFileSync(fileName, 'utf8');
            configCache = yaml.load(data) as AgentsConfig;
        } catch (e) {
            throw new Error(`Cannot read the agent config file: ${fileName}`);
        }
    }

    return configCache;
}

getConfig();