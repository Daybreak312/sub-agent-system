// Response VO 추상화 - 비즈니스 로직에서 통신 방식을 알 필요 없도록 함
import {Client} from "./models/Client.js";

export interface ResponseNotifier<T> {
    /**
     * 응답 데이터를 클라이언트에게 전송
     * @param data 전송할 데이터
     */
    notify(data: T): Promise<void>;

    /**
     * 에러 알림 전송
     * @param error 에러 정보
     */
    notifyError(error: Error): Promise<void>;
}

