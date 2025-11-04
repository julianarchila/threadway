import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { Message, vMessage, vMessageStatus } from "../validators";

const SUPER_SECRET = process.env.AGENT_SECRET;

export const createThread = mutation({
  args: { userId: v.id("users"), secret: v.string() },
  handler: async (ctx, args) => {
    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope");
    }

    const threadId = await ctx.db.insert("thread", { userId: args.userId });
    return { _id: threadId as Id<"thread">, userId: args.userId };
  },
});

export const getOrCreateThreadByUser = mutation({
  args: { userId: v.id("users"), secret: v.string() },
  handler: async (ctx, args) => {
    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope");
    }

    const existing = await ctx.db
      .query("thread")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) return existing;

    const threadId = await ctx.db.insert("thread", { userId: args.userId });
    const created = await ctx.db.get(threadId);
    if (!created) throw new Error("Failed to create thread");
    return created;
  },
});

export const appendMessage = mutation({
  args: {
    threadId: v.id("thread"),
    userId: v.id("users"),
    status: vMessageStatus,
    message: v.optional(vMessage),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope");
    }

    const id = await ctx.db.insert("messages", {
      threadId: args.threadId,
      userId: args.userId,
      status: args.status,
      message: args.message,
      text: args.message ? extractTextFromMessage(args.message) : undefined,
      tool: args.message ? messageContainsTool(args.message) : false,
    });
    return id;
  },
});


const messageContainsTool = (message: Message) => {
  if (message.role === "tool") return true;
  if (message.role !== "assistant") return false;

  const content = message.content;
  if (!Array.isArray(content)) return false;

  return content.some(
    (part) => part && (part.type === "tool-call" || part.type === "tool-result"),
  );
}

// Extract readable text from messages for indexing in `messages.text`.
const extractTextFromMessage = (message: Message): string | undefined => {
  try {
    if (message.role === "system") {
      return typeof message.content === "string" ? message.content : undefined;
    }

    if (message.role === "user") {
      const c: any = message.content as any;
      if (typeof c === "string") return c;
      if (Array.isArray(c)) {
        const parts: string[] = [];
        for (const part of c) {
          if (part && typeof part === "object" && part.type === "text" && typeof part.text === "string") {
            parts.push(part.text);
          }
        }
        return parts.length ? parts.join("\n") : undefined;
      }
      return undefined;
    }

    if (message.role === "assistant") {
      const c: any = message.content as any;
      if (typeof c === "string") return c;
      if (Array.isArray(c)) {
        const parts: string[] = [];
        for (const part of c) {
          if (!part || typeof part !== "object") continue;
          if (part.type === "text" && typeof part.text === "string") {
            parts.push(part.text);
          }
          if (part.type === "tool-result" && part.output) {
            const out: any = part.output;
            if (out.type === "text" && typeof out.value === "string") {
              parts.push(out.value);
            } else if (out.type === "content" && Array.isArray(out.value)) {
              for (const entry of out.value) {
                if (entry && typeof entry === "object" && entry.type === "text" && typeof entry.text === "string") {
                  parts.push(entry.text);
                }
              }
            }
          }
        }
        return parts.length ? parts.join("\n") : undefined;
      }
      return undefined;
    }

    if (message.role === "tool") {
      const c: any = message.content as any;
      if (Array.isArray(c)) {
        const parts: string[] = [];
        for (const part of c) {
          if (part && typeof part === "object" && part.type === "tool-result" && part.output) {
            const out: any = part.output;
            if (out.type === "text" && typeof out.value === "string") {
              parts.push(out.value);
            } else if (out.type === "content" && Array.isArray(out.value)) {
              for (const entry of out.value) {
                if (entry && typeof entry === "object" && entry.type === "text" && typeof entry.text === "string") {
                  parts.push(entry.text);
                }
              }
            }
          }
        }
        return parts.length ? parts.join("\n") : undefined;
      }
      return undefined;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

export const setMessageStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: vMessageStatus,
    error: v.optional(v.string()),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope");
    }

    await ctx.db.patch(args.messageId, {
      status: args.status,
      error: args.error,
    });
    return args.messageId;
  },
});

export const appendMessages = mutation({
  args: {
    threadId: v.id("thread"),
    userId: v.id("users"),
    status: vMessageStatus,
    messages: v.array(vMessage),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope");
    }

    const ids: Id<"messages">[] = [];
    for (const message of args.messages) {
      const id = await ctx.db.insert("messages", {
        threadId: args.threadId,
        userId: args.userId,
        status: args.status,
        message,
        text: extractTextFromMessage(message),
        tool: messageContainsTool(message),
      });
      ids.push(id);
    }
    return ids;
  },
});


