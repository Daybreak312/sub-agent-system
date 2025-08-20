import path from "path";
import {AgentConfig} from "../mcp/AgentsConfig.js";
import fs from "fs";

const CONTEXTS_FOLDER_NAME = "contexts";
const MARKER_FILE = ".root-marker"

let rootPathCache: string | undefined;

export function rootPath(...p: string[]): string {

    if (rootPathCache) {
        return path.join(rootPathCache, ...p);
    }

    let currentDir = import.meta.dirname;

    while (!fs.existsSync(path.join(currentDir, MARKER_FILE))) {
        currentDir = path.dirname(currentDir);
    }

    rootPathCache = currentDir;

    return path.join(rootPathCache, ...p);
}

export function contextFilePathByInfo(agent: AgentConfig): string {
    return contextFilePathById(agent.id);
}

export function contextFilePathById(id: string): string {
    return rootPath(CONTEXTS_FOLDER_NAME, id + ".md");

}