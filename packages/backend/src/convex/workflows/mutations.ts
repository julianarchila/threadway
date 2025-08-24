import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { 
  createWorkflowCreationError, 
  createWorkflowNotFoundError, 
  createWorkflowUpdateError,
  createUserNotAuthorizedError,
  createContentTooLongError,
  createInvalidUserIdError,
  createInvalidWorkflowIdError
} from "./error";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

// Constantes
const MAX_CONTENT_LENGTH = 100000; // 100KB


export const create = mutation({
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }
    
    const now = Date.now()

    // create a new workflow
    const workflowId = await ctx.db.insert("workflows", {
      title: "New Agent",
      content: "",
      userId: userId as Id<"users">,
      updatedAt: now,
    })

    return workflowId

  }
})

export const update = mutation({
  args: {
    workflowId: v.id("workflows"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) {
      throw createWorkflowNotFoundError(args.workflowId)
    }

    if (workflow.userId !== userId) {
      throw createUserNotAuthorizedError(userId, args.workflowId)
    }

    if (args.content.length > MAX_CONTENT_LENGTH) {
      throw createContentTooLongError(MAX_CONTENT_LENGTH)
    }

    await ctx.db.patch(args.workflowId, {
      content: args.content,
      updatedAt: Date.now(),
    })

    return args.workflowId
  }
})

export const updateTitle = mutation({
  args: {
    workflowId: v.id("workflows"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }
    
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) {
      throw createWorkflowNotFoundError(args.workflowId)
    }

    if (workflow.userId !== userId) {
      throw createUserNotAuthorizedError(userId, args.workflowId)
    }

    // Validate title length (reasonable limit)
    if (args.title.length > 200) {
      throw new Error("Title too long (max 200 characters)")
    }

    if (args.title.trim().length === 0) {
      throw new Error("Title cannot be empty")
    }

    await ctx.db.patch(args.workflowId, {
      title: args.title.trim(),
      updatedAt: Date.now(),
    })

    return args.workflowId
  }
})
