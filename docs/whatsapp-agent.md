## WhatsApp Agent Overview

This document explains how inbound Kapso WhatsApp webhooks flow through the Threadway codebase and how the agent responds.

## Event Pipeline

1. Kapso delivers events to Inngest, triggering `incomingKapsoMessage` in `apps/webapp/src/lib/ingest.ts`. The handler uses `verifyWebhook` to validate the Kapso HMAC signature before continuing.
2. The payload is normalized via `kapsoChannel.normalizeInbound` (`apps/webapp/src/lib/agent/channel/kapso.ts`) so downstream logic can treat every message consistently (`from`, `to`, `text`, `sourceId`).
3. The handler looks up the user with `getCurrentUser` (`apps/webapp/src/lib/agent/state/users.ts`). If no user exists, a welcome message is sent through `kapsoChannel.sendText` and processing stops.
4. For known users, the handler fetches (or creates) the long-lived conversation thread using `getOrCreateThreadByUser` (`apps/webapp/src/lib/agent/state/api.ts`).
5. The inbound message is persisted by calling `appendMessage` with `status: "pending"`. This mutation lives in `packages/backend/src/convex/agent/mutations.ts` and writes to the `messages` table.
6. Recent, non-tool messages are fetched through `listRecentMessages` to build conversation history. The query automatically supplements the last *k* messages with relevant search hits for better recall (`packages/backend/src/convex/agent/queries.ts`).
7. The agent runs via `runAgent` (`apps/webapp/src/lib/agent/llm/run-agent.ts`), loading any connected user tools, calling the Anthropic model through the Vercel AI SDK, and appending the assistant/tool responses back into Convex with `appendMessages`.
8. On success the WhatsApp reply is delivered, and `setMessageStatus` marks the inbound record as `success`. Errors trigger a generic fallback response and store the failure details on the message.

All Convex mutations and queries invoked from the client require the shared `AGENT_SECRET`, injected in every request (`apps/webapp/src/lib/agent/state/api.ts` and `users.ts`).

## Kapso Integration

`apps/webapp/src/lib/kapso.ts` encapsulates all Kapso-specific utilities:

- `verifyWebhook` re-computes the Kapso HMAC signature using `KAPSO_WEBHOOK_SECRET` and rejects mismatches with a `NonRetriableError` so Inngest will not retry invalid requests.
- `whatsappClient` is instantiated from `@kapso/whatsapp-cloud-api`; `kapsoChannel.sendText` delegates outbound messages to this client using the configured `KAPSO_PHONE_NUMBER_ID`.

## Convex Data Model

`packages/backend/src/convex/schema.ts` defines the persistence layer:

- `thread` holds a single conversation per user (`index: by_user`).
- `messages` captures every turn with fields for `status`, optional structured `message`, denormalized `text`, `tool` flag, and optional `error`. The table supports both `index: by_thread` and a `text_search` index to drive retrieval augmentation.

`packages/backend/src/convex/validators.ts` provides runtime validators that mirror the AI SDK message schema, guaranteeing that Convex functions only accept valid user, assistant, system, or tool payloads. The `vMessageStatus` union restricts statuses to `pending`, `success`, or `failed`.

## Convex Functions

- `getOrCreateThreadByUser`, `appendMessage`, `appendMessages`, and `setMessageStatus` live in `packages/backend/src/convex/agent/mutations.ts`. Each mutation checks the `AGENT_SECRET` before writing. Helper utilities like `extractTextFromMessage` populate the `messages.text` field for search and the `tool` flag for downstream filtering.
- `getUserByPhoneNumber`, `getUserConnectedToolkits`, and `listRecentMessages` are implemented in `packages/backend/src/convex/agent/queries.ts`. `listRecentMessages` is responsible for assembling an ordered history: filtering out tool messages (by default), picking the last *k* entries, and merging in neighbors around search hits for the latest user text.

## Agent Execution

When `runAgent` runs, it:

1. Loads user-specific tool definitions with `loadUserTools`.
2. Builds the prompt with `systemPrompt` (`apps/webapp/src/agent/prompts.ts`), prior history, and current user input.
3. Invokes Anthropic Claude Sonnet 4.5 through `ai.gateway` (wrapped by Braintrust for tracing if enabled).
4. Writes the assistant/tool responses back to Convex with `appendMessages`, which preserves rich message structure and sets `status: "success"`.
5. Returns the plain-text portion for WhatsApp delivery. Failures are wrapped in an `AgentError` so callers can log and notify the user gracefully.

## Error Handling & Logging

- Signature failures raise `NonRetriableError`, ensuring Inngest skips retries for invalid payloads.
- The ingestion handler logs key checkpoints (user lookup, thread selection, persistence IDs, agent execution results) to aid debugging.
- When the agent fails, the system replies with `GENERIC_CHAT_ERROR_MESSAGE`, and `setMessageStatus` records the failure for later inspection.

## Secrets & Configuration

Environment variables required for the pipeline include:

- `AGENT_SECRET` for authenticating Convex access.
- Kapso configuration: `KAPSO_WEBHOOK_SECRET`, `KAPSO_API_KEY`, `KAPSO_PHONE_NUMBER_ID`.
- Optional Braintrust keys: `BRAINTRUST_API_KEY`, `BRAINTRUST_PROJECT_NAME`.

Ensure these values are set in both the ingestion environment (Inngest runtime) and any client invoking Convex functions.


