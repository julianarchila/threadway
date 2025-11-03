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

  const message =
    msg.type === "user"
      ? (() => {
          const textPart: any = { type: "text", text: msg.text };
          if (msg.providerMetadata) textPart.providerMetadata = msg.providerMetadata;
          return {
            role: "user" as const,
            content: [textPart],
            providerOptions: {},
          };
        })()
      : (() => {
          const textPart: any = { type: "text", text: msg.text };
          if (msg.providerMetadata) textPart.providerMetadata = msg.providerMetadata;
          return {
            role: "assistant" as const,
            content: [textPart],
            providerOptions: {},
          };
        })();

  return convexClient.mutation(api.agent.mutations.appendMessage, {
    threadId,
    userId,
    status,
    message: message as any,
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


