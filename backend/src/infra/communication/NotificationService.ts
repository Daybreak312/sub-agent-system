// 알림 서비스 인터페이스 - 다양한 통신 방식을 추상화
export interface NotificationService {
    /**
     * 클라이언트 연결 초기화
     */
    initialize(): Promise<void>;

    /**
     * 모든 연결된 클라이언트에게 메시지 브로드캐스트
     * @param message 전송할 메시지
     */
    broadcast(message: any): Promise<void>;

    /**
     * 특정 클라이언트에게 메시지 전송
     * @param clientId 클라이언트 식별자
     * @param message 전송할 메시지
     */
    send(clientId: string, message: any): Promise<void>;

    /**
     * 연결된 클라이언트 수 반환
     */
    getConnectedClientsCount(): number;

    /**
     * 서비스 종료 및 정리
     */
    shutdown(): Promise<void>;
}

