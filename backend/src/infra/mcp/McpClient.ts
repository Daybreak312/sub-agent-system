import {GeminiClient} from "./impl/GeminiClient.js";

/**
 * 프롬프트의 구성 요소입니다.
 */
export interface PromptProps {
    /**
     * AI에게 전달할 주요 프롬프트.
     */
    prompt: string,

    /**
     * 이전의 대화 등 문맥에 대한 정보.
     */
    contexts?: string[],

    /**
     * 시스템 프롬프트.
     *
     * AI에게 답변 구조, 대화 형식 등 다양한 기본적인 설정을 제시하는 등 시스템적인 프롬프트.
     */
    systemPrompt?: string,

    /**
     * 실제로 사용할 자세한 모델.
     *
     * 생략 시 기본적으로 설정된 모델을 사용합니다.
     */
    modelName?: string
}

/**
 * 외부의 AI를 호출하기 위한 API 클라이언트.
 *
 * 에이전트와는 독립되는 단순 클라이언트로, 에이전트에 대한 정보를 저장하지 않습니다.
 */
export interface McpClient {

    /**
     * 클라이언트의 초기화 과정을 실행합니다.
     */
    initialize(): Promise<void>;

    /**
     * 주어진 프롬프트를 바탕으로 텍스트를 생성합니다.
     *
     * @returns 생성된 텍스트 문자열
     * @param props {@link PromptProps}
     */
    sendPrompt(props: PromptProps): Promise<string>;

    /**
     * 클라이언트의 종료 과정을 실행합니다.
     */
    finalize(): Promise<void>;
}

/**
 * 다양한 종류의 {@link McpClient}를 생성하는 팩토리 클래스입니다.
 */
export class McpClientFactory {

    /**
     * 해당 클래스는 실제 인스턴스 생성용이 아닌, 정적 메소드의 집합으로써 활용되기 때문에 생성자를 직접 호출할 수 없습니다.
     */
    private constructor() {
    }

    /**
     * Google의 Gemini {@link McpClient}를 생성합니다.
     */
    static gemini(): McpClient {
        return GeminiClient.getInstance();
    }
}
