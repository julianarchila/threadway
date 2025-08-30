
type IntegrationsErrorType = 'INTEGRATION_CREATION_FAILED' | 'INTEGRATION_LOOKUP_FAILED' | 'INTEGRATION_DELETION_FAILED' | 'INTEGRATION_QUERY_FAILED';

export class IntegrationsError extends Error {
    readonly name = 'IntegrationsError';
    constructor(public readonly type: IntegrationsErrorType, message: string, public readonly cause?: unknown) {
        super(message);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IntegrationsError)
        }
    }
}