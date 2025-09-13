import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  createWorkflowNotFoundError,
  createUserNotAuthorizedError,
  createContentTooLongError,
} from "./error";
import { authComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

// Constantes
const MAX_CONTENT_LENGTH = 100000; // 100KB


export const create = mutation({
  handler: async (ctx) => {
    const currentUser = await authComponent.safeGetAuthUser(ctx)
    if (!currentUser || !currentUser.userId) {
      throw new Error("User not authenticated")
    }

    const now = Date.now()

    // create a new workflow
    const workflowId = await ctx.db.insert("workflows", {
      title: "New Agent",
      content: "",
      userId: currentUser.userId as Id<"users">,
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
    const currentUser = await authComponent.safeGetAuthUser(ctx)
    if (!currentUser || !currentUser.userId) {
      throw new Error("User not authenticated")
    }

    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) {
      throw createWorkflowNotFoundError(args.workflowId)
    }

    if (workflow.userId !== currentUser.userId) {
      throw createUserNotAuthorizedError(currentUser.userId, args.workflowId)
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
    const currentUser = await authComponent.safeGetAuthUser(ctx)
    if (!currentUser || !currentUser.userId) {
      throw new Error("User not authenticated")
    }

    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) {
      throw createWorkflowNotFoundError(args.workflowId)
    }

    if (workflow.userId !== currentUser.userId) {
      throw createUserNotAuthorizedError(currentUser.userId, args.workflowId)
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

export const deleteWorkflow = mutation({
  args: {
    id: v.id("workflows"),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.safeGetAuthUser(ctx)
    if (!currentUser || !currentUser.userId) {
      throw new Error("User not authenticated")
    }

    const workflow = await ctx.db.get(args.id)
    if (!workflow) {
      throw createWorkflowNotFoundError(args.id)
    }

    if (workflow.userId !== currentUser.userId) {
      throw createUserNotAuthorizedError(currentUser.userId, args.id)
    }

    await ctx.db.delete(args.id)

    return args.id
  }
})
