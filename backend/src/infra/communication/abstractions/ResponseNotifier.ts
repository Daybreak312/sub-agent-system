// Response VO 추상화 - 비즈니스 로직에서 통신 방식을 알 필요 없도록 함
export interface ResponseNotifier<T> {
    /**
     * 응답 데이터를 클라이언트에게 전송
     * @param data 전송할 데이터
     * @param eventType 이벤트 타입 (progress, complete, error 등)
     */
    notify(data: T, eventType?: string): Promise<void>;

    /**
     * 진행상황 업데이트 전송
     * @param data 진행상황 데이터
     */
    notifyProgress(data: T): Promise<void>;

    /**
     * 완료 알림 전송
     * @param data 최종 결과 데이터
     */
    notifyComplete(data: T): Promise<void>;

    /**
     * 에러 알림 전송
     * @param error 에러 정보
     */
    notifyError(error: Error): Promise<void>;
}

