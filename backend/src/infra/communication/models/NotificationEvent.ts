export interface NotificationEvent<T = any> {
    data: T;
    timestamp: Date;
    requestId: string;
}

export class NotificationEventBuilder<T> {
    private event: Partial<NotificationEvent<T>> = {
        timestamp: new Date()
    };

    static of<T>(data: T): NotificationEventBuilder<T> {
        return new NotificationEventBuilder<T>().setData(data);
    }

    private setData(data: T): this {
        this.event.data = data;
        return this;
    }

    setRequestId(id: string): this {
        this.event.requestId = id;
        return this;
    }

    build(): NotificationEvent<T> {
        return this.event as NotificationEvent<T>;
    }
}
