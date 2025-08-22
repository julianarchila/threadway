# Backend Agent Guidelines

## Commands
- `pnpm dev` - Start Convex development server with live reload
- `pnpm dev:setup` - Initialize Convex with configuration setup
- From root: `pnpm dev:backend` - Start backend only
- From root: `pnpm check-types` - Type check backend code

## File Structure

### Root Level Files
- `schema.ts` - Database schema with tables and indexes
- `auth.ts` - Better Auth configuration and user management
- `auth.config.ts` - Authentication provider settings
- `http.ts` - HTTP routes and webhooks
- `convex.config.ts` - Convex app configuration with components

### Feature Organization
Organize code by domain/feature in separate folders:

```
feature-name/
├── queries.ts     # Database reads (query functions)
├── mutations.ts   # Database writes (mutation functions) 
├── actions.ts     # External API calls, AI, third-party services
├── helpers.ts     # Shared utilities and business logic
├── utils.ts       # Pure functions and data transformations
├── error.ts       # Domain-specific error types
└── validation.ts  # Zod schemas and input validation
```

## Core Patterns

### Function Types
- `query` - Read-only database operations, cached
- `mutation` - Database writes, transactional
- `action` - External API calls, file uploads, AI inference
- `internalAction` - Server-side only actions
- `httpAction` - HTTP endpoints and webhooks

### Error Handling (neverthrow)
**ALWAYS use neverthrow Result types instead of try/catch:**

```ts
// ❌ Avoid try/catch
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  throw new Error('Failed');
}

// ✅ Use Result types
import { ok, err, Result } from 'neverthrow';

const safeOperation = async (): Promise<Result<Data, MyError>> => {
  const result = await externalCall();
  if (result.isErr()) {
    return err(new MyError('OPERATION_FAILED', result.error.message));
  }
  return ok(result.value);
};
```

### Custom Error Types
Create domain-specific error classes:

```ts
type MyErrorType = 'VALIDATION_FAILED' | 'NOT_FOUND' | 'EXTERNAL_SERVICE_ERROR';

export class MyError extends Error {
  constructor(
    public readonly type: MyErrorType,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'MyError';
  }
}
```

### Validation
Use Zod for all input validation:

```ts
import { z } from 'zod';

const MySchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/),
  message: z.string().min(1).max(1600),
});

export const validateInput = (input: unknown) => {
  const result = MySchema.safeParse(input);
  return result.success ? ok(result.data) : err(new ValidationError(result.error));
};
```

### Database Operations
- Always use indexes for queries
- Use `withIndex()` for efficient lookups
- Handle not found cases with Result types

### Third-party Integrations
- Wrap external calls in Result types using `fromThrowable`
- Create adapter functions to normalize external APIs
- Use environment variables for configuration