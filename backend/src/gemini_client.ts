// src/gemini_client.ts
// Gemini API와의 모든 통신을 담당하는 중앙 클라이언트 모듈입니다.

import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';
import log from './utils/logger.js';

let genAI: GoogleGenAI;

/**
 * Gemini 클라이언트를 초기화하는 비동기 함수.
 */
export async function initializeGeminiClient() {
    try {
        dotenv.config();
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const errorMsg = "GEMINI_API_KEY environment variable is not set";
            log.error(errorMsg, 'SYSTEM');
            throw new Error(errorMsg);
        }

        genAI = new GoogleGenAI({apiKey});
        log.info('Gemini Client 초기화 완료', 'SYSTEM');
    } catch (error) {
        log.error("Gemini Client 초기화 실패", 'SYSTEM', {error});
        throw error;
    }
}

/**
 * 주어진 프롬프트를 바탕으로 텍스트를 생성합니다.
 * @param prompt - LLM에게 보낼 프롬프트 문자열
 * @param modelName - 사용할 모델의 이름
 * @returns 생성된 텍스트 문자열
 */
export async function generateText(prompt: string, modelName: string = "gemini-2.5-flash"): Promise<string> {
    try {
        if (!genAI) {
            const errorMsg = "Gemini Client가 초기화되지 않았습니다";
            log.error(errorMsg, 'SYSTEM');
            throw new Error(errorMsg);
        }

        log.debug('텍스트 생성 요청', 'SYSTEM', {modelName, promptLength: prompt.length});
        const text = (await genAI.models.generateContent({
            model: modelName,
            contents: [{role: "user", parts: [{text: prompt}]}],
        })).text;

        if (!text) {
            throw new Error("No text generated");
        }

        log.debug('텍스트 생성 완료', 'SYSTEM', {
            modelName,
            responseLength: text.length
        });

        if (text.startsWith("```json") && text.endsWith("```")) {
            // Remove JSON code block formatting if present
            return text.slice(8, -3).trim();
        }
        if (text.startsWith("```") && text.endsWith("```")) {
            // Remove code block formatting if present
            return text.slice(3, -3).trim();
        }

        return text;
    } catch (error) {
        log.error('텍스트 생성 실패', 'SYSTEM', {error, modelName});
        throw error;
    }
}
