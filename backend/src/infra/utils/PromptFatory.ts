interface Agent {
    id: string;
    description: string;
}

export const PLAN_OUTPUT_FORMAT = `{
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
      "requires_context": boolean; // 이 단계의 에이전트들이 이전의 대화 문맥을 필요로 하는지 여부
    }
  ]
}`

export const AGENT_OUTPUT_FORMAT = `{
  "raw": string // 생성한 전체 답변 내��
  "summation": string // 생성한 답변의 핵심 내용을 3줄로 요약
}`

export const FINAL_OUTPUT_FORMAT = `{
    "final_user_answer": string // 최종 답변"
    "final_answer_summary": "최종 답변의 핵심 요약을 5줄로 작성"
}`


export class PromptBuilder {

    private finalPrompt: string = "";

    withRequest(prompt: string) {
        this.finalPrompt +=
            `
--- 사용자의 요청 ---
"${prompt}"`;
        return this;
    }

    withSystemPrompt(systemPrompt: string) {
        this.finalPrompt +=
            `
--- 나의 역할 및 지침 ---
${systemPrompt}`;
        return this;
    }

    withTask(task: string) {
        this.finalPrompt +=
            `
--- 새로운 작업 ---
${task}`;
        return this;
    }

    withPreviousOutput(previousOutput: string) {
        this.finalPrompt +=
            `
--- 이전 단계 결과물 ---
${previousOutput}`;
        return this;
    }

    withContexts(contexts: string[]) {
        this.finalPrompt +=
            `
--- 허브의 이전 대화 문맥 ---
${contexts.join('\n\n---\n\n')}`;
        return this;
    }

    withOutputFormat(format: string) {
        this.finalPrompt +=
            `
--- 출력 형식 규칙 ---
반드시 아래의 형식으로 출력해야 합니다. 

**중요: JSON 출력 시 다음 특수 구분자를 사용하세요:**
- 시작: \x02 (보이지 않는 제어문자)
- 종료: \x03 (보이지 않는 제어문자)

예시: \x02{"type": "result", "data": "내용"}\x03

이 방식을 사용하면 JSON 파싱 오류를 방지할 수 있습니다.
각 값을 절대로 누락하지 마세요.

${format}`;
        return this;
    }

    withCustomSection(title: string, content: string) {
        this.finalPrompt +=
            `
--- ${title} ---
${content}`;
        return this;
    }

    build() {
        return this.finalPrompt;
    }
}

export class PromptFactory {
    static planPrompt(availableAgents: Agent[], userPrompt: string) {
        return new PromptBuilder()
            .withTask(
                `당신은 여러 전문가 에이전트들을 지휘하는 마스터 오케스트레이터입니다.
사용자의 요청을 해결하기 위한 최적의 '에이전트 체인 계획'을 아래의 JSON 형식으로 수립해야 합니다.`)
            .withRequest(userPrompt)
            .withCustomSection(
                "사용 가능한 에이전트 목록",
                JSON.stringify(availableAgents, null, 2)
            )
            .withOutputFormat(PLAN_OUTPUT_FORMAT)
    }

    static taskPrompt(task: string, hubContext?: string, previousOutput?: string) {
        const builder = new PromptBuilder()
            .withTask(task)

        if (hubContext) {
            builder.withContexts([hubContext]);
        }

        if (previousOutput) {
            builder.withCustomSection(
                "이전 에이전트의 응답",
                previousOutput
            )
        }

        builder.withOutputFormat(AGENT_OUTPUT_FORMAT);

        return builder;
    }

    static finalAnswerPrompt(userPrompt: string, results: any[]) {
        return new PromptBuilder()
            .withTask(
                `당신은 마스터 오케스트레이터입니다.
아래는 사용자의 요청을 처리하기 위해 실행한 에이전트 체인의 결과입니다.
이 모든 결과를 종합하여, 사용자를 위한 최종적이고 통합된 답변을 아래 JSON 형식에 맞추어 생성해주세요.`)
            .withRequest(userPrompt)
            .withCustomSection(
                "에이전트 실행 결과",
                JSON.stringify({results}, null, 2)
            )
            .withOutputFormat(FINAL_OUTPUT_FORMAT);
    }
}
