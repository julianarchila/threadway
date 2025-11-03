import { convexClient } from "@/lib/convex";
import { api } from "@threadway/backend/convex/api";
import type { Id } from "@threadway/backend/convex/dataModel";

const SUPER_SECRET = process.env.AGENT_SECRET || "";

export async function getOrCreateThreadByUser(userId: Id<"users">) {
  return convexClient.mutation(api.agent.mutations.getOrCreateThreadByUser, {
    userId,
    secret: SUPER_SECRET,
  });
}

export async function listRecentMessages(params: { threadId: Id<"thread">; limit: number }) {
  return convexClient.query(api.agent.queries.listRecentMessages, {
    threadId: params.threadId,
    limit: params.limit,
    secret: SUPER_SECRET,
  });
}

type BasicUserMessage = {
  type: "user";
  text: string;
  providerMetadata?: Record<string, unknown>;
};

type BasicAssistantMessage = {
  type: "assistant";
  text: string;
  providerMetadata?: Record<string, unknown>;
};

export async function appendMessage(params: {
  threadId: Id<"thread">;
  userId: Id<"users">;
  status: "pending" | "success" | "failed";
  msg: BasicUserMessage | BasicAssistantMessage;
  error?: string;
}) {
  const { threadId, userId, status, msg, error } = params;

  type StoredTextPart = { type: "text"; text: string; providerMetadata?: Record<string, unknown> };
  type StoredUserMessage = { role: "user"; content: StoredTextPart[]; providerOptions?: Record<string, unknown> };
  type StoredAssistantMessage = { role: "assistant"; content: StoredTextPart[]; providerOptions?: Record<string, unknown> };

  const message: StoredUserMessage | StoredAssistantMessage =
    msg.type === "user"
      ? (() => {
          const textPart: StoredTextPart = { type: "text", text: msg.text };
          if (msg.providerMetadata) textPart.providerMetadata = msg.providerMetadata;
          return {
            role: "user",
            content: [textPart],
            providerOptions: {},
          } as StoredUserMessage;
        })()
      : (() => {
          const textPart: StoredTextPart = { type: "text", text: msg.text };
          if (msg.providerMetadata) textPart.providerMetadata = msg.providerMetadata;
          return {
            role: "assistant",
            content: [textPart],
            providerOptions: {},
          } as StoredAssistantMessage;
        })();

  return convexClient.mutation(api.agent.mutations.appendMessage, {
    threadId,
    userId,
    status,
    message,
    text: undefined,
    tool: false,
    error,
    secret: SUPER_SECRET,
  });
}

export async function setMessageStatus(params: {
  messageId: Id<"messages">;
  status: "pending" | "success" | "failed";
  error?: string;
}) {
  return convexClient.mutation(api.agent.mutations.setMessageStatus, {
    messageId: params.messageId,
    status: params.status,
    error: params.error,
    secret: SUPER_SECRET,
  });
}


