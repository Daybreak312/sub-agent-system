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
            return JSON.parse(text) as T;
        } catch (error) {
            log.error(`JSON 파싱 실패: ${context}`, 'SYSTEM', {
                error,
                rawText: text
            });
            log.error(`원본 데이터:\n${text}`, 'SYSTEM');
            throw new JSONParseError(
                `JSON 파싱 실패 (${context}): ${error instanceof Error ? error.message : 'Unknown error'}`,
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
