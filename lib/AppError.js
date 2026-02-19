/**
 * Base AppError class for structured error categorization.
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, category = "UNEXPECTED_ERROR", details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.category = category;
        this.details = details;
        this.isOperational = true; // For distinguishing known vs unknown errors

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Errors from third-party API providers (VTpass, MobileNig)
 */
export class ProviderError extends AppError {
    constructor(message, statusCode = 502, details = null) {
        super(message, statusCode, "PROVIDER_ERROR", details);
    }
}

/**
 * User input validation errors
 */
export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, "VALIDATION_ERROR", details);
    }
}

/**
 * Authentication and Authorization errors
 */
export class AuthError extends AppError {
    constructor(message, statusCode = 401, details = null) {
        super(message, statusCode, "AUTH_ERROR", details);
    }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
    constructor(message = "Resource not found", details = null) {
        super(message, 404, "NOT_FOUND", details);
    }
}

/**
 * Business logic errors (e.g., insufficient balance)
 */
export class BusinessError extends AppError {
    constructor(message, details = null) {
        super(message, 400, "BUSINESS_ERROR", details);
    }
}
