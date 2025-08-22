
type AuthErrorType = 'USER_CREATION_FAILED' | 'USER_LOOKUP_FAILED' | 'INVALID_PHONE_NUMBER';
export class AuthError extends Error {
    constructor(public readonly type: AuthErrorType, message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'AuthError';
    }
}