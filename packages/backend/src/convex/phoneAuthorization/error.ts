// Combined error types for phone authorization
export type PhoneAuthorizationErrorType =
    | 'AUTHORIZED_PHONE_NOT_FOUND'
    | 'USER_NOT_AUTHORIZED'
    | 'PHONE_ALREADY_AUTHORIZED'
    | 'RATE_LIMIT_EXCEEDED';

export class PhoneAuthorizationError extends Error {
    constructor(
        public readonly type: PhoneAuthorizationErrorType,
        message: string,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'PhoneAuthorizationError';
    }
}

// Helper functions to create specific errors
export const createAuthorizedPhoneNotFoundError = (phoneId: string, cause?: unknown) =>
    new PhoneAuthorizationError(
        'AUTHORIZED_PHONE_NOT_FOUND',
        `Authorized phone with ID '${phoneId}' not found`,
        cause
    );

export const createUserNotAuthorizedError = (userId: string, resourceId: string) =>
    new PhoneAuthorizationError(
        'USER_NOT_AUTHORIZED',
        `User '${userId}' is not authorized to access resource '${resourceId}'`
    );

export const createPhoneAlreadyAuthorizedError = (phoneNumber: string, ownerId: string) =>
    new PhoneAuthorizationError(
        'PHONE_ALREADY_AUTHORIZED',
        `Phone number '${phoneNumber}' is already authorized by owner '${ownerId}'`
    );

export const createRateLimitExceededError = (action: string, maxAttempts: number, windowMinutes: number) =>
    new PhoneAuthorizationError(
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded for ${action}. Maximum ${maxAttempts} attempts allowed per ${windowMinutes} minutes. Please try again later.`
    );
