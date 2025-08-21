import {ResponseNotifier} from '../ResponseNotifier.js';
import {NotificationService} from '../NotificationService.js';
import {NotificationEventBuilder} from '../models/NotificationEvent.js';
import log from '../../utils/Logger.js';

export class WebSocketResponseNotifier<T> implements ResponseNotifier<T> {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly requestId: string
    ) {
    }

    async notify(data: T): Promise<void> {
        try {
            const event = NotificationEventBuilder.of(data).setRequestId(this.requestId).build();

            await this.notificationService.broadcast(event);
            log.debug('응답 알림 전송 완료', 'NOTIFIER');
        } catch (error) {
            log.error('응답 알림 전송 실패', 'NOTIFIER');
            throw error;
        }
    }

    async notifyError(error: Error): Promise<void> {
        const event = NotificationEventBuilder.of({
            message: error.message,
            stack: error.stack,
            name: error.name
        }).build();

        await this.notificationService.broadcast(event);
        log.debug('에러 알림 전송', 'NOTIFIER', {error: error.message});
    }
}
