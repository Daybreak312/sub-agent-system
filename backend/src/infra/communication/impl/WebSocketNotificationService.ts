import {WebSocket, WebSocketServer} from 'ws';
import {Server} from 'http';
import {NotificationService} from '../abstractions/NotificationService.js';
import log from '../../utils/Logger.js';

export class WebSocketNotificationService implements NotificationService {
    private wss?: WebSocketServer;
    private clients = new Map<string, WebSocket>();
    private clientIdCounter = 0;

    constructor(private server: Server) {
    }

    async initialize(): Promise<void> {
        this.wss = new WebSocketServer({
            server: this.server,
            // TCP Nagle 알고리즘 비활성화로 즉시 전송 보장
            perMessageDeflate: false
        });

        this.wss.on('connection', (ws) => {
            const clientId = this.generateClientId();
            this.clients.set(clientId, ws);

            // TCP_NODELAY 설정으로 즉시 전송 강제 (타입 안전한 방법)
            const socket = (ws as any)._socket;
            if (socket && typeof socket.setNoDelay === 'function') {
                socket.setNoDelay(true);
                log.debug('TCP_NODELAY 설정 완료', 'WEBSOCKET', {clientId});
            }

            log.info('새로운 WebSocket 연결', 'WEBSOCKET', {clientId});

            ws.on('error', (error) => {
                log.error('WebSocket 에러', 'WEBSOCKET', {clientId, error});
            });

            ws.on('close', () => {
                this.clients.delete(clientId);
                log.info('WebSocket 연결 종료', 'WEBSOCKET', {clientId});
            });
        });

        log.info('WebSocket 서비스 초기화 완료', 'WEBSOCKET');
    }

    async broadcast(message: any): Promise<void> {
        const messageStr = JSON.stringify(message);
        const deadClients: string[] = [];

        // 실시간 전송을 보장하기 위한 로깅
        log.info('WebSocket 메시지 브로드캐스트 시작', 'WEBSOCKET', {
            messageType: message.type,
            clientCount: this.clients.size,
            timestamp: new Date().toISOString()
        });

        const sendPromises: Promise<void>[] = [];

        for (const [clientId, client] of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                const sendPromise = new Promise<void>((resolve, reject) => {
                    try {
                        client.send(messageStr, (error) => {
                            if (error) {
                                log.error('메시지 전송 실패', 'WEBSOCKET', {clientId, error});
                                deadClients.push(clientId);
                                reject(error);
                            } else {
                                log.debug('메시지 전송 성공', 'WEBSOCKET', {clientId});
                                resolve();
                            }
                        });
                    } catch (error) {
                        log.error('메시지 전송 중 예외', 'WEBSOCKET', {clientId, error});
                        deadClients.push(clientId);
                        reject(error);
                    }
                });
                sendPromises.push(sendPromise.catch(() => {
                })); // 에러를 무시하고 계속 진행
            } else {
                deadClients.push(clientId);
            }
        }

        // 모든 메시지 전송 완료까지 기다림
        await Promise.all(sendPromises);

        // 연결이 끊긴 클라이언트 정리
        deadClients.forEach(clientId => this.clients.delete(clientId));

        log.info('WebSocket 메시지 브로드캐스트 완료', 'WEBSOCKET', {
            successCount: this.clients.size - deadClients.length,
            failureCount: deadClients.length
        });
    }

    async send(clientId: string, message: any): Promise<void> {
        const client = this.clients.get(clientId);
        if (!client) {
            throw new Error(`Client ${clientId} not found`);
        }

        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(message));
            } catch (error) {
                log.error('개별 메시지 전송 실패', 'WEBSOCKET', {clientId, error});
                this.clients.delete(clientId);
                throw error;
            }
        } else {
            this.clients.delete(clientId);
            throw new Error(`Client ${clientId} connection is not open`);
        }
    }

    getConnectedClientsCount(): number {
        return this.clients.size;
    }

    async shutdown(): Promise<void> {
        if (this.wss) {
            this.wss.close();
            this.clients.clear();
            log.info('WebSocket 서비스 종료', 'WEBSOCKET');
        }
    }

    private generateClientId(): string {
        return `client_${++this.clientIdCounter}_${Date.now()}`;
    }
}
