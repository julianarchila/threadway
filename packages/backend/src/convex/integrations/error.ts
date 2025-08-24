
type IntegrationsErrorType = 'INTEGRATION_CREATION_FAILED' | 'INTEGRATION_LOOKUP_FAILED' | 'INTEGRATION_DELETION_FAILED';

export class IntegrationsError extends Error {
    constructor(public readonly type: IntegrationsErrorType, message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'IntegrationsError';
    }
}