// Tipos de errores para workflows
export type WorkflowErrorType = 
  | 'WORKFLOW_NOT_FOUND' 
  | 'WORKFLOW_CREATION_FAILED' 
  | 'WORKFLOW_UPDATE_FAILED' 
  | 'INVALID_WORKFLOW_ID' 
  | 'USER_NOT_AUTHORIZED'
  | 'CONTENT_TOO_LONG'
  | 'INVALID_USER_ID';

export class WorkflowError extends Error {
  constructor(
    public readonly type: WorkflowErrorType, 
    message: string, 
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

// Funciones helper para crear errores específicos
export const createWorkflowNotFoundError = (workflowId: string, cause?: unknown) => 
  new WorkflowError(
    'WORKFLOW_NOT_FOUND', 
    `Workflow with ID '${workflowId}' not found`, 
    cause
  );

export const createWorkflowCreationError = (workflowId: string, cause?: unknown) => 
  new WorkflowError(
    'WORKFLOW_CREATION_FAILED', 
    `Failed to create workflow with ID '${workflowId}'`, 
    cause
  );

export const createWorkflowUpdateError = (workflowId: string, cause?: unknown) => 
  new WorkflowError(
    'WORKFLOW_UPDATE_FAILED', 
    `Failed to update workflow with ID '${workflowId}'`, 
    cause
  );

export const createInvalidWorkflowIdError = (workflowId: string) => 
  new WorkflowError(
    'INVALID_WORKFLOW_ID', 
    `Invalid workflow ID format: '${workflowId}'`
  );

export const createUserNotAuthorizedError = (userId: string, workflowId: string) => 
  new WorkflowError(
    'USER_NOT_AUTHORIZED', 
    `User '${userId}' is not authorized to modify workflow '${workflowId}'`
  );

export const createContentTooLongError = (maxLength: number) => 
  new WorkflowError(
    'CONTENT_TOO_LONG', 
    `Content exceeds maximum length of ${maxLength} characters`
  );

export const createInvalidUserIdError = (userId: string) => 
  new WorkflowError(
    'INVALID_USER_ID', 
    `Invalid user ID: '${userId}'`
  ); 