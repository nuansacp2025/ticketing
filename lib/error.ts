export class ApiError extends Error {
    public status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.status = status;
      Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export class UnauthorizedError extends ApiError {
    constructor() { super('Unauthorized', 401); Object.setPrototypeOf(this, UnauthorizedError.prototype); }
}

export class ForbiddenError extends ApiError {
    constructor() { super('Not an admin', 403); Object.setPrototypeOf(this, ForbiddenError.prototype); }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class ConflictError extends ApiError {
    constructor(message: string) {
        super(message, 409);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}