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
      tool: args.message ? messageContainsTool(args.message) : false,
    });
    return id;
  },
});


const messageContainsTool = (message: Message) => {

  return message.role === "assistant" ? typeof message.content !== "string" ? !!message.content.find((part) => part.type === "tool-result") : false : false;

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
        tool: messageContainsTool(message),
      });
      ids.push(id);
    }
    return ids;
  },
});


