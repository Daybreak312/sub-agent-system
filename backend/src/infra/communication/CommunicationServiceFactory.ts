// 통신 서비스 팩토리 - 다양한 통신 방식을 쉽게 전환할 수 있도록 함
import {Server} from 'http';
import {NotificationService} from './abstractions/NotificationService.js';
import {ResponseNotifier} from './abstractions/ResponseNotifier.js';
import {WebSocketNotificationService} from './impl/WebSocketNotificationService.js';
import {WebSocketResponseNotifier} from './impl/WebSocketResponseNotifier.js';

export type CommunicationConfig = {
    notificationType: 'websocket' | 'sse' | 'polling';
};

export class CommunicationServiceFactory {
    static createNotificationService(
        config: CommunicationConfig,
        server: Server
    ): NotificationService {
        switch (config.notificationType) {
            case 'websocket':
                return new WebSocketNotificationService(server);
            // 향후 SSE, 폴링 등 다른 방식 추가 가능
            case 'sse':
                throw new Error('SSE notification service not implemented yet');
            case 'polling':
                throw new Error('Polling notification service not implemented yet');
            default:
                throw new Error(`Unsupported notification type: ${config.notificationType}`);
        }
    }

    static createResponseNotifier<T>(
        notificationService: NotificationService
    ): ResponseNotifier<T> {
        return new WebSocketResponseNotifier<T>(notificationService);
    }
}
