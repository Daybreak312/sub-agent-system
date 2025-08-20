// 알림 이벤트 모델
import {Client} from "./Client.js";

export interface NotificationEvent<T = any> {
    data: T;
    timestamp: Date;
    client: Client;
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

    setClient(client: Client): this {
        this.event.client = client;
        return this;
    }

    build(): NotificationEvent<T> {
        return this.event as NotificationEvent<T>;
    }
}
