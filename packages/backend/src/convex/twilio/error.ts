// Unified error types for Twilio operations
export type TwilioError = {
  readonly type: 'CONFIG_MISSING' | 'SEND_FAILED' | 'INVALID_INPUT' | 'VALIDATION_FAILED' | 'WEBHOOK_PARSE_ERROR';
  readonly message: string;
  readonly cause?: unknown;
};

// Legacy SMS error type for backwards compatibility
export type SMSError = TwilioError;
