import winston from 'winston';
import {rootPath} from "./PathUtils.js";

const logFormat = winston.format.printf(({level, message, timestamp, category}) => {
    return `${timestamp} [${level}] [${category}]: ${message}`;
});

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
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
            filename: rootPath("logs", "combined.log"),
            level: 'info'
        }),
        // 에러 로그 파일
        new winston.transports.File({
            filename: rootPath("logs", "error.log"),
            level: 'error'
        }),
        // 에이전트 액션 로그 파일
        new winston.transports.File({
            filename: rootPath("logs", "agent-actions.log"),
            level: 'info'
        })
    ]
});

// 로그 함수들
export const log = {
    error: (message: string, category: string, metadata?: object) => {
        logger.error(message, {category});
    },
    warn: (message: string, category: string, metadata?: object) => {
        logger.warn(message, {category});
    },
    info: (message: string, category: string, metadata?: object) => {
        logger.info(message, {category});
    },
    debug: (message: string, category: string, metadata?: object) => {
        logger.debug(message, {category});
    }
};

export default log;
