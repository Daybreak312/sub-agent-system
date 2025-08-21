import log from './Logger.js';
import { ProtocolDelimiter } from './ProtocolDelimiter.js';

export class JSONParseError extends Error {
    constructor(message: string, public rawData: string) {
        super(message);
        this.name = 'JSONParseError';
    }
}

export const jsonUtils = {
    parse<T>(text: string, context: string): T {
        try {
            // 1. 먼저 구분자 방식으로 시도
            const delimiterResult = ProtocolDelimiter.decode<T>(text);
            if (delimiterResult !== null) {
                log.debug('구분자 방식으로 파싱 성공', 'JSON', { context });
                return delimiterResult;
            }

            // 2. 구분자가 없으면 기존 JSON 블록 파싱 시도
            const cleanedText = unboxingCodeBlock(text);
            return JSON.parse(cleanedText);

        } catch (error) {
            // 구분자와 일반 JSON 모두 실패한 경우
            log.error('JSON 파싱 실패 - 구분자와 일반 방식 모두 실패', 'JSON', {
                context,
                hasDelimiter: ProtocolDelimiter.hasDelimiter(text),
                textLength: text.length,
                preview: text.substring(0, 200)
            });

            throw new JSONParseError(
                `JSON 파싱 실패 (${context}): ${error instanceof Error ? error.message : 'Unknown error'}
                
                구분자 방식 시도: ${ProtocolDelimiter.hasDelimiter(text) ? '감지됨' : '감지 안됨'}
                원본 텍스트 미리보기:
                ${text.substring(0, 500)}...
                `,
                text
            );
        }
    },

    // 구분자 방식으로 인코딩하는 새로운 메서드
    encodeWithDelimiter(data: any, context: string): string {
        try {
            // 데이터 안전성 검증
            if (!ProtocolDelimiter.isDataSafe(data)) {
                log.warn('데이터에 구분자 문자가 포함되어 있음', 'JSON', { context });
            }

            return ProtocolDelimiter.encode(data);
        } catch (error) {
            log.error(`구분자 인코딩 실패: ${context}`, 'JSON', {
                error,
                dataType: typeof data
            });
            throw new Error(`구분자 인코딩 실패 (${context}): ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    stringify(data: any, context: string): string {
        try {
            return JSON.stringify(data);
        } catch (error) {
            log.error(`JSON 직렬화 실패: ${context}`, 'JSON', {
                error,
                dataType: typeof data
            });
            throw new Error(`JSON 직렬화 실패 (${context}): ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};

function unboxingCodeBlock(text: any): string {
    // string 타입이 아니면 그대로 반환
    if (typeof text !== 'string') {
        return text;
    }

    if (text.startsWith("```json") && text.endsWith("```")) {
        // Remove JSON code block formatting if present
        return text.slice(7, -3).trim();
    }
    if (text.startsWith("```") && text.endsWith("```")) {
        // Remove code block formatting if present
        return text.slice(3, -3).trim();
    }

    return text;
}