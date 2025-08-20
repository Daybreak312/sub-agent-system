import { ResponseNotifier } from '../abstractions/ResponseNotifier.js';
import { NotificationService } from '../abstractions/NotificationService.js';
import { NotificationEventBuilder } from '../models/NotificationEvent.js';
import log from '../../utils/Logger.js';

export class WebSocketResponseNotifier<T> implements ResponseNotifier<T> {
    constructor(private notificationService: NotificationService) {}

    async notify(data: T, eventType: string = 'custom'): Promise<void> {
        try {
            const event = {
                type: eventType,
                data,
                timestamp: new Date()
            };

            await this.notificationService.broadcast(event);
            log.debug('응답 알림 전송 완료', 'NOTIFIER', { eventType });
        } catch (error) {
            log.error('응답 알림 전송 실패', 'NOTIFIER', { eventType, error });
            throw error;
        }
    }

    async notifyProgress(data: T): Promise<void> {
        const event = NotificationEventBuilder.progress(data).build();
        await this.notificationService.broadcast(event);
        log.debug('진행상황 알림 전송', 'NOTIFIER');
    }

    async notifyComplete(data: T): Promise<void> {
        const event = NotificationEventBuilder.complete(data).build();
        await this.notificationService.broadcast(event);
        log.debug('완료 알림 전송', 'NOTIFIER');
    }

    async notifyError(error: Error): Promise<void> {
        const event = NotificationEventBuilder.error({
            message: error.message,
            stack: error.stack,
            name: error.name
        }).build();

        await this.notificationService.broadcast(event);
        log.debug('에러 알림 전송', 'NOTIFIER', { error: error.message });
    }
}
