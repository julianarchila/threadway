export type AgentErrorType =
  | "FAILED_TO_LOAD_TOOLS"
  | "FAILED_TO_CREATE_AGENT"
  | "FAILED_TO_CONTINUE_THREAD"
  | "FAILED_TO_GENERATE_TEXT";

export class AgentError extends Error {
  readonly name = "AgentError";
  constructor(
    public readonly type: AgentErrorType,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentError);
    }
  }
}


