import { convexClient } from "@/lib/convex";
import { api } from "@threadway/backend/convex/api";
import type { Id } from "@threadway/backend/convex/dataModel";

import { ModelMessage } from "ai";

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


export async function appendMessage(params: {
  threadId: Id<"thread">;
  userId: Id<"users">;
  status: "pending" | "success" | "failed";
  msg: ModelMessage;
  error?: string;
}) {
  const { threadId, userId, status, msg } = params;

  return convexClient.mutation(api.agent.mutations.appendMessage, {
    threadId,
    userId,
    status,
    // @ts-expect-error: Minor difference between the types
    message: msg,
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

export async function appendMessages(params: {
  threadId: Id<"thread">;
  userId: Id<"users">;
  status: "pending" | "success" | "failed";
  msgs: ModelMessage[];
}) {
  const { threadId, userId, status, msgs } = params;

  return convexClient.mutation(api.agent.mutations.appendMessages, {
    threadId,
    userId,
    status,
    // @ts-expect-error: Minor difference between the types
    messages: msgs,
    secret: SUPER_SECRET,
  });
}


