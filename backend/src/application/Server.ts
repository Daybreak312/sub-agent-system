// src/Server.ts
// 웹 서버를 설정하고 API 엔드포인트를 정의하는 애플리케이션의 메인 진입점입니다.

import express from 'express';
import http from 'http';
import path from 'path';
import {fileURLToPath} from 'url';
import cors from 'cors';
import {errorHandler} from '../infra/errors/ErrorHandler.js';
import {BadRequestError} from '../infra/errors/AppError.js';
import {GeminiClient} from '../infra/mcp/impl/GeminiClient.js';
import {MainRunner} from '../domain/agents/MainRunner.js';
import {WebSocketNotificationService} from '../infra/communication/index.js';
import {WebSocketResponseNotifier} from '../infra/communication/index.js';
import log from '../infra/utils/Logger.js';
import {randomUUID} from "node:crypto";

// --- 서버 및 앱 초기화 ---
const app = express();
const server = http.createServer(app);
const mainRunner = new MainRunner();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3000;

// ES 모듈 환경에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 통신 서비스 초기화 ---
const notificationService = new WebSocketNotificationService(server);

// --- 미들웨어 설정 ---
app.use(express.json());
app.use(cors({origin: 'http://localhost:5173'}));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// --- API 엔드포인트 정의 ---

// 1. 메인 채팅 API
app.post('/api/prompt', async (req, res, next) => {
    try {
        const prompt = req.body.prompt;
        log.info('새로운 프롬프트 요청 수신', 'API', {prompt});

        if (!prompt) {
            throw new BadRequestError(`Prompt is required.`);
        }

        const requestId: string = req.header("request-id") ? req.header("request-id")! : "";

        const result = await mainRunner.handleUserPrompt(
            prompt,
            new WebSocketResponseNotifier(notificationService, requestId)
        );
        log.info('프롬프트 처리 완료', 'API', {prompt});
        res.setHeader("request-id", requestId);
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

// 3. 연결된 클라이언트 수 조회 API
app.get('/api/status', (req, res) => {
    res.json({
        connectedClients: notificationService.getConnectedClientsCount(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 글로벌 에러 핸들러는 모든 라우트 정의 후에 마지막에 추가
app.use(errorHandler);

// --- 서버 시작 함수 ---
async function startServer() {
    try {
        log.info('서버 초기화 시작...', 'SYSTEM');

        // 통신 서비스 초기화
        await notificationService.initialize();

        const geminiClient = GeminiClient.getInstance();
        await geminiClient.initialize();
        await mainRunner.initialize();

        // 포트 충돌 시 대안 포트 찾기
        const startPort = parseInt(PORT.toString());
        let currentPort = startPort;
        let serverStarted = false;

        while (!serverStarted && currentPort < startPort + 10) {
            try {
                await new Promise<void>((resolve, reject) => {
                    const serverInstance = server.listen(currentPort, () => {
                        log.info(`웹 서버가 http://localhost:${currentPort} 에서 실행 중입니다.`, 'SYSTEM', {port: currentPort});
                        serverStarted = true;
                        resolve();
                    });

                    serverInstance.on('error', (error: any) => {
                        if (error.code === 'EADDRINUSE') {
                            log.warn(`포트 ${currentPort}이 사용 중입니다. 다음 포트를 시도합니다.`, 'SYSTEM');
                            currentPort++;
                            reject(error);
                        } else {
                            reject(error);
                        }
                    });
                });
            } catch (error: any) {
                if (error.code !== 'EADDRINUSE') {
                    throw error;
                }
            }
        }

        if (!serverStarted) {
            throw new Error(`포트 ${startPort}-${startPort + 9} 범위에서 사용 가능한 포트를 찾을 수 없습니다.`);
        }

    } catch (error) {
        log.error('애플리케이션 시작 실패', 'SYSTEM', {error});
        process.exit(1);
    }
}

// --- Graceful Shutdown ---
process.on('SIGTERM', async () => {
    log.info('SIGTERM 신호 수신, 서버 종료 중...', 'SYSTEM');
    await shutdown();
});

process.on('SIGINT', async () => {
    log.info('SIGINT 신호 수신, 서버 종료 중...', 'SYSTEM');
    await shutdown();
});

async function shutdown() {
    log.info('서버 종료 프로세스 시작...', 'SYSTEM');

    try {
        // 1. WebSocket 서비스 종료
        log.info('WebSocket 서비스 종료 중...', 'SYSTEM');
        await notificationService.shutdown();

        // 2. HTTP 서버 종료
        log.info('HTTP 서버 종료 중...', 'SYSTEM');
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    log.error('HTTP 서버 종료 실패', 'SYSTEM', {error});
                    reject(error);
                } else {
                    log.info('HTTP 서버가 정상적으로 종료되었습니다', 'SYSTEM');
                    resolve();
                }
            });
        });

        // 3. MainRunner 종료 (에이전트 프로세스들 정리)
        log.info('에이전트 시스템 종료 중...', 'SYSTEM');
        await mainRunner.shutdown();

        log.info('모든 서비스가 정상적으로 종료되었습니다', 'SYSTEM');
        process.exit(0);

    } catch (error) {
        log.error('서버 종료 중 오류 발생', 'SYSTEM', {error});

        // 오류가 발생해도 강제 종료
        log.warn('강제 종료를 진행합니다...', 'SYSTEM');
        process.exit(1);
    }
}

// 애플리케이션 시작
startServer();
