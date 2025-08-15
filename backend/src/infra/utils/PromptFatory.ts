interface Agent {
    id: string;
    description: string;
}

export const getPlanPrompt = (availableAgents: Agent[], userPrompt: string): string => {
    return `
당신은 여러 전문가 에이전트들을 지휘하는 마스터 오케스트레이터입니다.
사용자의 요청을 해결하기 위한 최적의 '에이전트 체인 계획'을 아래의 JSON 형식으로 수립해야 합니다.

--- 사용 가능한 에이전트 목록 ---
${JSON.stringify(availableAgents, null, 2)}

--- 사용자의 요청 ---
"${userPrompt}"

--- 출력 규칙 ---
반드시 아래의 JSON 형식으로 출력해야 합니다.

{
  "reasoning" : string; // 이 계획을 수립한 전반적인 이유 (클라이언트 표시용)
  "steps": [
    {
      "step": number; // 실행 순서 (0, 1, 2...), 각 단계는 바로 이전 단계의 결과 전체를 참조 가능
      "calls": [
        {
          "agent_id": string; // 호출할 에이전트의 ID
          "reasoning": string; // 이 에이전트를 호출하는 이유 (클라이언트 표시용)
          "task": string; // 이 에이전트에게 부여된 구체적인 작업 내용
        }
      ]; // 이 단계에서 병렬로 호출될 에이전트 목록
      "requires_context": boolean; // 이 단계의 에이전트들이 이전의 대��� 문맥을 필요로 하는지 여부
    }
  ]
}`;
};

export const getTaskPrompt = (systemPrompt: string, task: string, hubContext?: string, previousOutput?: string): string => {
    return `
${hubContext ? `--- 허브의 이전 대화 문맥 --- ${hubContext}` : ''}

--- 나의 역할 및 지침 ---
${systemPrompt}
위 내용을 바탕으로, 반드시 다음 JSON 형식에 맞추어 응답.

--- 새로운 작업 ---
${task}
${previousOutput ? `\n\n--- 이전 단계 결과물 ---\n${previousOutput}` : ''}

--- 출력 형식 규칙 ---
{
  "raw": string // 생성한 전체 답변 내용,
  "summation": string // 생성한 답변의 핵심 내용을 3줄로 요약
}`;
};

export const getFinalAnswerPrompt = (userPrompt: string, results: any[]): string => {
    return `
당신은 마스터 오케스트레이터입니다.
아래는 사용자의 요청을 처리하기 위해 실행한 에이전트 체인의 결과입니다.
이 모든 결과를 종합하여, 사용자를 위한 최종적이고 통합된 답변을 아래 JSON 형식에 맞추어 생성해주세요.

--- 사용자의 요청 ---
"${userPrompt}"

--- 답변 형식 ---
{
    "final_user_answer": string // 최종 답변",
    "final_answer_summary": "최종 답변의 핵심 요약을 5줄로 작성"
}

--- 에이전트 실행 결과 ---
${JSON.stringify({ results }, null, 2)}`;
};

