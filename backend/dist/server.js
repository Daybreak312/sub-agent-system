// src/server.ts
// 웹 서버를 설정하고 API 엔드포인트를 정의하는 애플리케이션의 메인 진입점입니다.
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'; // CORS 미들웨어 임포트
// 우리가 작성한 핵심 에이전트 관리 및 실행 로직을 임포트합니다.
import { handleUserPrompt, initializeSystem, getSystemStatus, stopAgent } from './main_runner.js';
import { initializeGeminiClient } from "./gemini_client.js";
// --- 서버 및 앱 초기화 ---
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
// ES 모듈 환경에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- 미들웨어 설정 ---
app.use(express.json()); // POST 요청의 JSON 본문을 파싱하기 위해 필요합니다.
app.use(cors({ origin: 'http://localhost:5173' })); // CORS 허용: 프론트엔드 포트 지정
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist'))); // 프론트엔드 빌드 파일을 서빙하기 위한 설정
// --- API 엔드포인트 정의 ---
// 1. 메인 채팅 API
app.post('/api/prompt', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const result = await handleUserPrompt(prompt);
        res.json(result);
    }
    catch (error) {
        console.error('[Server] Error handling prompt:', error);
        res.status(500).json({ error: 'An internal error occurred.', details: error.message });
    }
});
// 2. 에이전트 상태 확인 API (헬스체크)
app.get('/api/agents/status', (req, res) => {
    try {
        const status = getSystemStatus();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get agent status.', details: error.message });
    }
});
// 3. 에이전트 관리 API (예: 중지)
app.post('/api/agents/:agentId/stop', (req, res) => {
    try {
        const { agentId } = req.params;
        const result = stopAgent(agentId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to stop agent.', details: error.message });
    }
});
// --- 서버 시작 함수 ---
async function startServer() {
    try {
        await initializeGeminiClient();
        await initializeSystem();
        server.listen(PORT, () => {
            console.log(`[Server] 웹 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
        });
    }
    catch (error) {
        console.error('[Server] 애플리케이션 시작에 실패했습니다:', error);
        process.exit(1);
    }
}
// 애플리케이션 시작
startServer();
