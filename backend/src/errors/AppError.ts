export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true,
        public stack = ''
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(400, message);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, message);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(422, message);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error') {
        super(500, message);
    }
}

export class AgentError extends AppError {
    constructor(message: string) {
        super(500, message);
        this.name = 'AgentError';
    }
}
