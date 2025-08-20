# 실시간 통신 모듈 설계 문서

## 📋 개요

이 문서는 기존 ChainExecutor.ts와 main.ts에 분산되어 있던 TCP 로직과 WebSocket 통신을 하나의 모듈로 분리한 설계를 설명합니다.

## 🎯 설계 목표

1. **관심사 분리**: 비즈니스 로직에서 통신 방식을 완전히 추상화
2. **확장성**: 다양한 통신 방식(WebSocket, SSE, 폴링 등)을 쉽게 추가 가능
3. **재사용성**: 다른 프로젝트에서도 활용 가능한 독립적인 모듈
4. **테스트 용이성**: 인터페이스 기반으로 Mock 구현체 쉽게 생성 가능

## 🏗️ 아키텍처

```
infra/communication/
├── abstractions/          # 추상화 계층
│   ├── ResponseNotifier.ts     - 응답 알림 인터페이스
│   ├── NotificationService.ts  - 통신 서비스 인터페이스  
│   └── HealthCheckService.ts   - 헬스체크 서비스 인터페이스
├── impl/                 # 구체적 구현체
│   ├── WebSocketResponseNotifier.ts
│   ├── WebSocketNotificationService.ts
│   └── TcpHealthCheckService.ts
├── models/               # 데이터 모델
│   └── NotificationEvent.ts
├── CommunicationServiceFactory.ts  # 팩토리 패턴
└── index.ts             # 모듈 진입점
```

## 🔧 핵심 컴포넌트

### 1. ResponseNotifier<T>
비즈니스 로직에서 사용하는 메인 인터페이스입니다.

```typescript
interface ResponseNotifier<T> {
    notifyProgress(data: T): Promise<void>;
    notifyComplete(data: T): Promise<void>;
    notifyError(error: Error): Promise<void>;
}
```

**특징:**
- 제네릭 타입으로 다양한 데이터 타입 지원
- 비동기 처리로 논블로킹 통신
- 통신 방식에 독립적인 추상화

### 2. NotificationService
실제 통신을 담당하는 서비스 인터페이스입니다.

```typescript
interface NotificationService {
    initialize(): Promise<void>;
    broadcast(message: any): Promise<void>;
    send(clientId: string, message: any): Promise<void>;
    getConnectedClientsCount(): number;
    shutdown(): Promise<void>;
}
```

### 3. HealthCheckService
에이전트 상태 모니터링을 담당합니다.

```typescript
interface HealthCheckService {
    checkAgent(agentId: string, host: string, port: number): Promise<HealthCheckResult>;
    checkAllAgents(agents: AgentInfo[]): Promise<HealthCheckResult[]>;
    startPeriodicCheck(intervalMs: number, onHealthChange: (result: HealthCheckResult) => void): void;
    stopPeriodicCheck(): void;
}
```

## 🔄 사용 흐름

### 1. 서버 초기화 시
```typescript
// 통신 설정
const config = {
    notificationType: 'websocket' as const,
    healthCheckType: 'tcp' as const
};

// 팩토리를 통한 서비스 생성
const notificationService = CommunicationServiceFactory.createNotificationService(config, server);
const responseNotifier = CommunicationServiceFactory.createResponseNotifier<FinalOutput>(notificationService);
const healthCheckService = CommunicationServiceFactory.createHealthCheckService(config);

// 서비스 초기화
await notificationService.initialize();

// 비즈니스 로직에 주입
mainRunner.setResponseNotifier(responseNotifier);
```

### 2. 비즈니스 로직에서 사용
```typescript
export class ChainExecutor {
    constructor(
        private agentRegistry: AgentRegistry,
        private history: ConversationHistory,
        private responseNotifier?: ResponseNotifier<FinalOutput>
    ) {}

    async execute(userPrompt: string, plan: AgentChainPlan): Promise<FinalOutput> {
        // 진행상황 알림 (통신 방식에 무관)
        await this.responseNotifier?.notifyProgress(output);
        
        // 비즈니스 로직 실행...
        
        // 완료 알림
        await this.responseNotifier?.notifyComplete(finalOutput);
        
        return finalOutput;
    }
}
```

## 🎨 확장 가능성

### 새로운 통신 방식 추가
```typescript
// SSE 구현체 예시
export class SSENotificationService implements NotificationService {
    // SSE 구현...
}

// 팩토리에 추가
case 'sse':
    return new SSENotificationService(server);
```

### 다른 헬스체크 방식 추가
```typescript
// HTTP 헬스체크 구현체 예시
export class HttpHealthCheckService implements HealthCheckService {
    // HTTP 기반 헬스체크 구현...
}
```

## 🧪 테스트 전략

### Mock 구현체 생성
```typescript
class MockResponseNotifier<T> implements ResponseNotifier<T> {
    public notifications: Array<{type: string, data: T}> = [];
    
    async notifyProgress(data: T): Promise<void> {
        this.notifications.push({type: 'progress', data});
    }
    
    async notifyComplete(data: T): Promise<void> {
        this.notifications.push({type: 'complete', data});
    }
    
    async notifyError(error: Error): Promise<void> {
        this.notifications.push({type: 'error', data: error as any});
    }
}
```

## 📊 주요 이점

1. **느슨한 결합**: 비즈니스 로직이 통신 구현에 의존하지 않음
2. **단일 책임**: 각 클래스가 하나의 책임만 가짐
3. **개방-폐쇄 원칙**: 새로운 통신 방식 추가 시 기존 코드 수정 불필요
4. **의존성 역전**: 고수준 모듈이 저수준 모듈에 의존하지 않음
5. **테스트 용이성**: 인터페이스 기반으로 Mock 객체 쉽게 생성

## 🚀 성능 고려사항

- **논블로킹 I/O**: 모든 통신이 비동기로 처리
- **연결 풀링**: WebSocket 연결을 효율적으로 관리
- **메모리 최적화**: 연결 해제된 클라이언트 자동 정리
- **에러 복구**: 통신 실패 시 자동 재시도 로직
