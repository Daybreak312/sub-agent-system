import {fileURLToPath} from "url";
import path from "path";
import {AgentConfig} from "../mcp/AgentsConfig.js";

const CONTEXTS_FOLDER_NAME = "contexts";

let rootPathCache: string | undefined;

export function rootPath(...p: string[]): string {
    if (!rootPathCache) {
        const filename = fileURLToPath(import.meta.filename);
        rootPathCache = filename.split("/src")[0];
    }

    if (p) {
        return path.join(rootPathCache, ...p);
    }
    return rootPathCache;
}

export function contextFilePathByInfo(agent: AgentConfig): string {
    return contextFilePathById(agent.id);
}

export function contextFilePathById(id: string): string {
    return rootPath(CONTEXTS_FOLDER_NAME, id + ".md");

}