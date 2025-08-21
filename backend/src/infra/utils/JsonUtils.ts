import log from './Logger.js';

export class JSONParseError extends Error {
    constructor(message: string, public rawData: string) {
        super(message);
        this.name = 'JSONParseError';
    }
}

export const jsonUtils = {
    parse<T>(text: string, context: string): T {
        try {
            return JSON.parse(unboxingCodeBlock(text));
        } catch (error) {
            throw new JSONParseError(
                `JSON 파싱 실패 (${context}): ${error instanceof Error ? error.message : 'Unknown error'}
                
                원본 텍스트:
                ${text}
                `,
                text
            );
        }
    },

    stringify(data: any, context: string): string {
        try {
            return JSON.stringify(data);
        } catch (error) {
            log.error(`JSON 직렬화 실패: ${context}`, 'SYSTEM', {
                error,
                dataType: typeof data,
                data: JSON.stringify(data, null, 2)
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