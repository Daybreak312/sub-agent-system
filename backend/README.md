# Local Agent Weaver Backend API Documentation

## API Endpoints

### POST /api/prompt
사용자의 프롬프트를 받아 에이전트 체인을 실행하고 결과를 반환합니다.

#### Request
```json
{
  "prompt": "string"
}
```

#### Response
```json
{
  "agent_chain_reasoning": "string",
  "agent_chain_log": [
    {
      "agent_name": "string",
      "reasoning": "string",
      "summation": "string"
    }
  ],
  "final_user_answer": "string",
  "final_answer_summary": "string"
}
```

#### Error Response
```json
{
  "error_code": "string",
  "message": "string",
  "details": "any?"
}
```

#### Status Codes
- 200: 성공
- 400: 잘못된 요청 (예: 빈 프롬프트)
- 500: 서버 에러 (예: 에이전트 실행 실패)

### GET /api/health
시스템과 모든 서브 에이전트의 상태를 확인합니다.

#### Response
```json
{
  "status": "ok | error",
  "agents": [
    {
      "id": "string",
      "name": "string",
      "status": "running | error | stopped",
      "last_health_check": "string"
    }
  ]
}
```

#### Status Codes
- 200: 모든 시스템 정상
- 500: 하나 이상의 시스템에 문제가 있음

## 웹소켓 이벤트

현재 버전에서는 웹소켓을 사용하지 않지만, 향후 실시간 진행 상황 업데이트를 위해 다음과 같은 이벤트들이 구현될 예정입니다:

### agent_progress
에이전트 체인 실행 중 각 단계의 진행 상황을 실시간으로 전송합니다.

```json
{
  "type": "agent_progress",
  "data": {
    "step": 0,
    "agent_name": "string",
    "status": "starting | in_progress | completed",
    "partial_result": "string?"
  }
}
```

### agent_error
에이전트 실행 중 발생한 에러를 실시간으로 전송합니다.

```json
{
  "type": "agent_error",
  "data": {
    "agent_name": "string",
    "error_code": "string",
    "message": "string"
  }
}
```

## 환경 변수

백엔드 실행을 위해 다음 환경 변수가 필요합니다:

- `GEMINI_API_KEY`: Gemini API 키
- `PORT`: (선택적) 서버 포트 번호 (기본값: 3000)
- `NODE_ENV`: (선택적) 실행 환경 (development/production)

## 에러 코드

- `INVALID_PROMPT`: 잘못된 프롬프트 (빈 문자열 등)
- `AGENT_EXECUTION_ERROR`: 에이전트 실행 중 오류 발생
- `AGENT_TIMEOUT`: 에이전트 실행 시간 초과
- `INVALID_AGENT_RESPONSE`: 에이전트로부터 잘못된 응답 수신
- `API_ERROR`: 외부 API (예: Gemini) 호출 실패
