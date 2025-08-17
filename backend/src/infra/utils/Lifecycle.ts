/**
 * 초기화 - 사용 - 종료의 생명주기를 가진 객체를 위한 인터페이스.
 */
export interface Lifecycle {

    /**
     * 객체 사용 이전에 초기화 과정을 수행합니다.
     */
    initialize(): Promise<void>;

    /**
     * 필요 없어진 객체를 종료합니다.
     */
    finalize(): Promise<void>;
}