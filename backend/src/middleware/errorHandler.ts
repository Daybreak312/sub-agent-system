import {Request, Response, NextFunction} from 'express';
import {AppError} from '../errors/AppError.js';
import log from '../utils/logger.js';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    log.error(err.message + " | " + err.stack, "SYSTEM")

    if (err instanceof AppError) {
        const appError = err as AppError;

        return res.status(appError.statusCode).json({
            status: 'error',
            statusCode: appError.statusCode,
            message: appError.message,
            ...(process.env.NODE_ENV === 'development' && {stack: appError.stack})
        });
    }

    // 처리되지 않은 에러의 경우
    console.error('[Error Handler]', err);
    return res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    });
};
