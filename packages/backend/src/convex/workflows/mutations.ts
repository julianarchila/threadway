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

// Constants
const MAX_CONTENT_LENGTH = 100000; // 100KB

// Mutation to create a new workflow
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

// Mutation to update the content of an existing workflow
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

// Mutation to update the title of an existing workflow
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

// Mutation to delete an existing workflow
export const deleteWorkflow = mutation({
  args: {
    id: v.id("workflows"),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const workflow = await ctx.db.get(args.id)
    if (!workflow) {
      throw createWorkflowNotFoundError(args.id)
    }

    if (workflow.userId !== userId) {
      throw createUserNotAuthorizedError(userId, args.id)
    }

    await ctx.db.delete(args.id)

    return args.id
  }
})

// Mutation to add an integration to a workflow
export const addIntegrationToWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Verify that the workflow exists and belongs to the user
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) {
      throw createWorkflowNotFoundError(args.workflowId)
    }
    if (workflow.userId !== userId) {
      throw createUserNotAuthorizedError(userId, args.workflowId)
    }

    // Verify that the connection exists and belongs to the user
    const connection = await ctx.db.get(args.connectionId)
    if (!connection) {
      throw new ConvexError("Connection not found")
    }
    if (connection.userId !== userId) {
      throw new ConvexError("Connection does not belong to user")
    }

    // Check if the integration is already added to avoid duplicates
    const existing = await ctx.db
      .query("workflowIntegrations")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .filter((q) => q.eq(q.field("connectionId"), args.connectionId))
      .first()
    if (existing) {
      throw new ConvexError("Integration already added to workflow")
    }

    // Insert the new relationship
    const integrationId = await ctx.db.insert("workflowIntegrations", {
      workflowId: args.workflowId,
      connectionId: args.connectionId,
    })

    return integrationId
  }
})

// Mutation to remove an integration from a workflow
export const removeIntegrationFromWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Verify that the workflow exists and belongs to the user
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) {
      throw createWorkflowNotFoundError(args.workflowId)
    }
    if (workflow.userId !== userId) {
      throw createUserNotAuthorizedError(userId, args.workflowId)
    }

    // Verify that the connection exists and belongs to the user
    const connection = await ctx.db.get(args.connectionId)
    if (!connection) {
      throw new ConvexError("Connection not found")
    }
    if (connection.userId !== userId) {
      throw new ConvexError("Connection does not belong to user")
    }

    // Find the existing relationship
    const existing = await ctx.db
      .query("workflowIntegrations")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .filter((q) => q.eq(q.field("connectionId"), args.connectionId))
      .first()
    if (!existing) {
      throw new ConvexError("Integration not associated with workflow")
    }

    // Delete the relationship
    await ctx.db.delete(existing._id)

    return args.connectionId
  }
})
