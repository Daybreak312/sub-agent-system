// 알림 이벤트 모델
export interface NotificationEvent<T = any> {
    type: 'progress' | 'complete' | 'error' | 'custom';
    data: T;
    timestamp: Date;
    eventId?: string;
}

export class NotificationEventBuilder<T> {
    private event: Partial<NotificationEvent<T>> = {
        timestamp: new Date()
    };

    static progress<T>(data: T): NotificationEventBuilder<T> {
        return new NotificationEventBuilder<T>().setType('progress').setData(data);
    }

    static complete<T>(data: T): NotificationEventBuilder<T> {
        return new NotificationEventBuilder<T>().setType('complete').setData(data);
    }

    static error<T>(data: T): NotificationEventBuilder<T> {
        return new NotificationEventBuilder<T>().setType('error').setData(data);
    }

    private setType(type: NotificationEvent<T>['type']): this {
        this.event.type = type;
        return this;
    }

    private setData(data: T): this {
        this.event.data = data;
        return this;
    }

    setEventId(eventId: string): this {
        this.event.eventId = eventId;
        return this;
    }

    build(): NotificationEvent<T> {
        return this.event as NotificationEvent<T>;
    }
}
