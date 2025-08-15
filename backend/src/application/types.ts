// types.ts

/**
 * 에이전트 시스템의 기본 설정 및 상태를 정의하는 타입들입니다.
 */
export interface Agent {
    id: string; // 에이전트의 고유 ID
    name: string; // 에이전트의 표시 이름
    type: string; // 에이전트의 유형 (예: 'sub_agent', 'hub_agent')
}

// --- 통신 기본 구조 ---

/**
 * 허브가 서브 에이전트에게 보내는 작업의 구조
 * '선택적 문맥 전달'을 위해 hub_context가 optional이 됩니다.
 */
export interface AgentTask {
    new_task: string;
    hub_context?: string; // 이제 선택적으로 전달됩니다.
}

/**
 * 서브 에이전트가 허브에게 반환하는 결과의 구조
 */
export interface AgentResult {
    raw: string;
    summation: string;
}

/**
 * API가 클라이언트에 에러를 반환할 때의 표준 구조
 */
export interface ErrorResponse {
    error_code: string;
    message: string;
    details?: any;
}


// --- 에이전트 체인 계획(Agent Chain Plan) 관련 타입 ---

/**
 * 체인의 한 단계(step)에 포함된 개별 에이전트 호출 정보
 */
export interface AgentCall {
    agent_id: string;
    task: string; // 이 에이전트에게 부여된 구체적인 작업 내용
    reasoning: string; // 이 에이전트를 호출하는 이유 (클라이언트 표시용)
}

/**
 * 에이전트 체인을 구성하는 개별 단계(step)
 * 하나의 step에는 여러 에이전트 호출이 포함될 수 있습니다.
 */
export interface AgentChainStep {
    step: number; // 실행 순서 (0, 1, 2...)
    calls: AgentCall[]; // 이 단계에서 호출될 에이전트 목록
    requires_context: boolean; // 이 단계의 에이전트들이 허브의 문맥을 필요로 하는지 여부
}

/**
 * 허브 에이전트가 1단계에서 생성하는 최종 '실행 계획'
 */
export interface AgentChainPlan {
    reasoning: string; // 이 계획을 수립한 전반적인 이유 (클라이언트 표시용)
    steps: AgentChainStep[];
}

// --- 최종 출력 타입 ---

/**
 * 에이전트 체인 로그의 개별 항목 구조
 */
export interface AgentChainLogEntry {
    agent_name: string;
    reasoning: string;
    summation?: string;
}

/**
 * 허브가 클라이언트 및 로그 파일에 최종적으로 기록하는 데이터의 구조
 */
export interface FinalOutput {
    final_user_answer?: string;  // 최종 답변이 완료되기 전까진 undefined
    final_answer_summary?: string;  // 최종 답변이 완료되기 전까진 undefined
    agent_chain_reasoning: string;  // 계획 단계에서 바로 설정됨
    agent_chain_log: AgentChainLogEntry[];  // 진행됨에 따라 추가됨
    is_complete: boolean;  // 전체 프로세스가 완료되었는지 여부
    current_step?: number;  // 현재 실행 중인 스텝 (0-based)
    total_steps?: number;  // 전체 스텝 수
}
