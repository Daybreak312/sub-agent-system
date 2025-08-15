import winston from 'winston';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFormat = winston.format.printf(({ level, message, timestamp, category }) => {
    return `${timestamp} [${level}] [${category}]: ${message}`;
});

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // 콘솔 출력
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            ),
            level: 'debug'
        }),
        // 일반 로그 파일
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            level: 'info'
        }),
        // 에러 로그 파일
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        // 에이전트 액션 로그 파일
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/agent-actions.log'),
            level: 'info'
        })
    ]
});

// 로그 레벨 정의
export const LogLevel = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
} as const;

// 로그 카테고리 정의
export const LogCategory = {
    SYSTEM: 'SYSTEM',
    AGENT: 'AGENT',
    API: 'API',
    SECURITY: 'SECURITY'
} as const;

// 로그 함수들
export const log = {
    error: (message: string, category: keyof typeof LogCategory, metadata?: object) => {
        logger.error(message, { category });
    },
    warn: (message: string, category: keyof typeof LogCategory, metadata?: object) => {
        logger.warn(message, { category });
    },
    info: (message: string, category: keyof typeof LogCategory, metadata?: object) => {
        logger.info(message, { category });
    },
    debug: (message: string, category: keyof typeof LogCategory, metadata?: object) => {
        logger.debug(message, { category });
    },
    agentAction: (agentId: string, action: string, metadata?: object) => {
        logger.info(`[${agentId}] ${action}`, { category: LogCategory.AGENT });
    }
};

export default log;
