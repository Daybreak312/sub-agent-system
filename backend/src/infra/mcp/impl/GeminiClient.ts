// src/GeminiClient.ts
// Gemini API와의 모든 통신을 담당하는 중앙 클라이언트 모듈입니다.

import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';
import log from '../../utils/Logger.js';
import {McpClient, PromptProps} from "../McpClient.js";

let genAI: GoogleGenAI;

/**
 * Google의 {@link https://gemini.google.com Gemini}를 호출하는 {@link McpClient}.
 *
 * 각각 호출에서 저장되거나 서로 영향을 끼치는 정보가 없으므로, 싱글톤으로 구현합니다.
 */
export class GeminiClient implements McpClient {

    private static instance: McpClient;

    public static getInstance(): McpClient {
        if (!this.instance) {
            this.instance = new GeminiClient();
        }

        return this.instance;
    }

    /**
     * 클라이언트의 초기화 과정을 실행합니다.
     */
    async initialize(): Promise<void> {
        initGoogleAiApi();
    }

    /**
     * 주어진 프롬프트를 바탕으로 텍스트를 생성합니다.
     *
     * @returns 생성된 텍스트 문자열
     * @param props
     */
    async sendPrompt(props: PromptProps): Promise<string> {
        await this.initialize();

        const modelName = props.modelName ? props.modelName : "gemini-2.5-flash";

        try {

            const text = (await genAI.models.generateContent({
                model: modelName,
                contents: {
                    text: props.prompt.build()
                }
            })).text;

            if (!text) {
                throw new Error("No text generated");
            }

            return text;
        } catch
            (error) {
            log.error('텍스트 생성 실패', 'SYSTEM', {error, modelName});
            throw error;
        }
    }

    async finalize(): Promise<void> {
    }
}

/**
 * 실제로 Gemini를 호출하는 외부 모듈을 초기화합니다.
 */
function initGoogleAiApi() {
    if (!genAI) {
        try {
            dotenv.config();
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                const errorMsg = "GEMINI_API_KEY environment variable is not set";
                log.error(errorMsg, 'SYSTEM');
                throw new Error(errorMsg);
            }

            genAI = new GoogleGenAI({apiKey});
            log.info('Successfully initialized gemini client.', 'SYSTEM');
        } catch (error) {
            log.error("Failed to initialize gemini client", 'SYSTEM', {error});
            throw error;
        }
    }
}
