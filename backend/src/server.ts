// src/server.ts
// 웹 서버를 설정하고 API 엔드포인트를 정의하는 애플리케이션의 메인 진입점입니다.

import express from 'express';
import http from 'http';
import path from 'path';
import {fileURLToPath} from 'url';
import cors from 'cors';
import {errorHandler} from './middleware/errorHandler.js';
import {BadRequestError} from './errors/AppError.js';
import {initializeGeminiClient} from "./gemini_client.js";
import {MainRunner} from './agents/MainRunner.js';
import log from './utils/logger.js';

// --- 서버 및 앱 초기화 ---
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const mainRunner = new MainRunner();

// ES 모듈 환경에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 미들웨어 설정 ---
app.use(express.json()); // POST 요청의 JSON 본문을 파싱하기 위해 필요합니다.
app.use(cors({origin: 'http://localhost:5173'})); // CORS 허용: 프론트엔드 포트 지정
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist'))); // 프론트엔드 빌드 파일을 서빙하기 위한 설정

// --- API 엔드포인트 정의 ---

// 1. 메인 채팅 API
app.post('/api/prompt', async (req, res, next) => {
    try {
        const {prompt} = req.body;
        log.info('새로운 프롬프트 요청 수신', 'API', {prompt});

        if (!prompt) {
            throw new BadRequestError('Prompt is required');
        }

        const result = await mainRunner.handleUserPrompt(prompt);
        log.info('프롬프트 처리 완료', 'API', {prompt});
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// 2. 에이전트 관리 API (예: 중지)
app.post('/api/agents/:agentId/stop', (req, res, next) => {
    try {
        const {agentId} = req.params;
        const result = mainRunner.stopAgent(agentId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// 글로벌 에러 핸들러는 모든 라우트 정의 후에 마지막에 추가
app.use(errorHandler);

// --- 서버 시작 함수 ---
async function startServer() {
    try {
        log.info('서버 초기화 시작...', 'SYSTEM');
        await initializeGeminiClient();
        await mainRunner.initialize();

        server.listen(PORT, () => {
            log.info(`웹 서버가 http://localhost:${PORT} 에서 실행 중입니다.`, 'SYSTEM', {port: PORT});
        });
    } catch (error) {
        log.error('애플리케이션 시작 실패', 'SYSTEM', {error});
        process.exit(1);
    }
}

// 애플리케이션 시작
startServer();