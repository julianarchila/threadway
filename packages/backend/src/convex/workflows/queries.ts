import { query } from "../_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

// Obtener workflow por ID
export const getWorkflowById = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, { workflowId }) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    // if (!userId) {
    //   throw new Error("User not authenticated")
    // }
    if (!userId) {
      return null
    }


    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_id", (q) => q.eq("_id", workflowId))
      .first()

    if (!workflow || workflow.userId !== userId) {
      throw new Error("Workflow not found")
    }

    return workflow
  }
});

// Obtener todos los workflows de un usuario
export const getUserWorkflows = query({
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    // if (!userId) {
    //   throw new Error("User not authenticated")
    // }

    // There is a bug with betterAuth component and tanstack start,
    // so for now we will just return an empty array if there is no user
    if (!userId) {
      return []
    }

    const workflows = await ctx.db
      .query("workflows")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .order("desc")
      .collect();

    return workflows.map(({ content, userId, ...rest }) => ({
      ...rest,
    }));
  },
});

export const getWorkflowConnections = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, { workflowId }) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const workflow = await ctx.db
      .get(workflowId);

    if (!workflow || workflow.userId !== userId) {
      throw new Error("Workflow not found");
    }

    const workflowIntegrations = await ctx.db
      .query("workflowIntegrations")
      .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
      .collect();

    const connections = await Promise.all(
      workflowIntegrations.map((wi) =>
        ctx.db.get(wi.connectionId)
      )
    );

    return connections.filter(Boolean);
  },
});

