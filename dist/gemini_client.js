// src/gemini_client.ts
// Gemini API와의 모든 통신을 담당하는 중앙 클라이언트 모듈입니다.
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
let genAI;
/**
 * Gemini 클라이언트를 초기화하는 비동기 함수.
 */
export async function initializeGeminiClient() {
    console.log('[GeminiClient] Initializing...');
    try {
        dotenv.config();
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not found in .env file");
        }
        genAI = new GoogleGenAI({ apiKey });
        console.log('[GeminiClient] Initialization successful.');
    }
    catch (error) {
        console.error("[GeminiClient] CRITICAL: Failed to initialize Gemini Client.");
        throw error;
    }
}
/**
 * 주어진 프롬프트를 바탕으로 텍스트를 생성합니다.
 * @param prompt - LLM에게 보낼 프롬프트 문자열
 * @param modelName - 사용할 모델의 이름
 * @returns 생성된 텍스트 문자열
 */
export async function generateText(prompt, modelName = "gemini-2.5-flash") {
    if (!genAI) {
        throw new Error("Gemini Client not initialized. Please call initializeGeminiClient() first.");
    }
    try {
        console.log(`[GeminiClient] Generating text with model ${modelName}...`);
        const response = await genAI.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const text = response.text;
        if (!text) {
            throw new Error("No text generated from Gemini API.");
        }
        console.log('[GeminiClient] Text generated successfully.');
        if (text.startsWith("```json") && text.endsWith("```")) {
            // Remove JSON code block formatting if present
            return text.slice(8, -3).trim();
        }
        if (text.startsWith("```") && text.endsWith("```")) {
            // Remove code block formatting if present
            return text.slice(3, -3).trim();
        }
        return text;
    }
    catch (error) {
        console.error(`[GeminiClient] Error generating text with model ${modelName}:`, error);
        throw new Error('Failed to generate text from Gemini API');
    }
}
