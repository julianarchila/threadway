# Backend Agent Guidelines

## Commands
- `pnpm dev` — Start Convex dev server with live reload
- `pnpm dev:setup` — Initialize Convex with configuration
- From root: `pnpm dev:backend` — Start backend only
- From root: `pnpm check-types` — Type check backend

## Structure

### Root files
- `schema.ts` — Database schema (tables + indexes)
- `auth.ts` / `auth.config.ts` — Better Auth setup
- `http.ts` — HTTP routes and webhooks
- `convex.config.ts` — Convex app configuration

### Feature folders (by domain)
- `actions.ts` — External APIs, AI, side effects
- `mutations.ts` — DB writes
- `queries.ts` — DB reads
- `helpers.ts` — Business logic (shared)
- `utils.ts` — Pure functions
- `error.ts` — Domain error types
- `validation.ts` — Zod schemas (when needed)

## Core patterns

### Convex function types
- `query` — Read-only DB
- `mutation` — DB writes (atomic)
- `action` — External calls / Node usage (opt-in via `"use node"`)
- `internalAction` — Server-side only actions
- `httpAction` — HTTP endpoints/webhooks
- `internalQuery` / `internalMutation` — Server-only DB access

### Runtime boundaries
- Add `"use node"` only in files that import Node-only libs (e.g. Twilio SDK, Composio).
- Do NOT import Node-only code into non-Node Convex files.
- Keep `utils.ts` pure (no Node, no I/O).

### Error handling
- Helpers/utils return `neverthrow` Result (no throwing).
- Convex entrypoints (actions/mutations/queries) unwrap `Result` and MAY throw domain errors.
- Domain-specific error classes per feature: `AuthError`, `WorkflowError`, `IntegrationsError`, `TwilioError` (with `type` and optional `cause`).
- Wrap external calls with `fromThrowable` / `fromAsyncThrowable`.

### Validation
- Use Convex `v` validators for function args.
- Use Zod for complex/external payloads (e.g., Twilio webhooks).
- Keep lightweight, focused validators in `utils.ts` for simple cases (e.g., phone normalization).

### Database & indexes
- Always query via an index: `.withIndex(...)`.
- Define indexes explicitly in `schema.ts`.
- Keep schema enums minimal and in-use (e.g., `connections.status` is `"INITIATED" | "ACTIVE"`).
- Prefer consistent field names (e.g., `toolkitSlug`).

### Background work
- Use `ctx.scheduler.runAfter(...)` to offload long-running tasks.
- Implement as `internalAction`s and keep them idempotent where possible.
- Never start long-running servers/watchers in Convex functions.

### Third-party integrations
- Isolate SDK usage behind `"use node"` files.
- Read configuration via environment variables.
- Normalize external payloads before using them.
- Use `neverthrow` for all external API invocations in helpers.

### Naming & style
- Files: kebab-case; Types/Interfaces: PascalCase; functions/vars: camelCase.
- Use precise, intent-revealing names (e.g., `initiateConnection`, `listUserConnections`, `toolkitSlug`).
- Keep modules small and cohesive; avoid unnecessary abstractions.

### Logging
- Keep logs minimal and useful: include feature prefix and key ids (e.g., `[integrations] connectionId=... userId=...`).
- Log only at decision points (success/failure) and external boundaries.

## Feature notes

### Integrations
- Public action: `initiateConnection` (returns redirect URL).
- Node-only work (Composio) lives in `"use node"` actions/helpers.
- Helpers use `neverthrow`; actions unwrap and throw `IntegrationsError`.
- Background waiter: `awaitConnectionStatus` (internalAction) updates to `ACTIVE`.

### Twilio
- `httpAction` validates signature, parses with Zod, normalizes payload, then delegates.
- Node-only SMS/OTP sending in `"use node"` utils using `neverthrow`.

### Agents
- Use `@convex-dev/agent` component.
- Maintain a single thread per user (`getUserThread` helper); keep agent config minimal and explicit.

## PR checklist
- Does helper/utility return `Result` instead of throwing?
- Do actions/mutations/queries unwrap Results and throw domain errors?
- Are Node-only imports confined to `"use node"` files?
- Are queries using proper indexes?
- Are names and fields consistent (`toolkitSlug`, function names, status enums)?
- Are magic numbers extracted as module-level `const` where helpful?
