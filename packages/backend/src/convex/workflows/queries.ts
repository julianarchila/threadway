import { query } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

// Obtener workflow por ID
export const getWorkflowById = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, { workflowId }) => {
    const currentUser = await authComponent.safeGetAuthUser(ctx)
    if (!currentUser || !currentUser.userId) {
      return null
    }


    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_id", (q) => q.eq("_id", workflowId))
      .first()

    if (!workflow || workflow.userId !== currentUser.userId) {
      throw new Error("Workflow not found")
    }

    return workflow
  }
});

// Obtener todos los workflows de un usuario
export const getUserWorkflows = query({
  handler: async (ctx) => {
    const currentUser = await authComponent.safeGetAuthUser(ctx)
    // There is a bug with betterAuth component and tanstack start,
    // so for now we will just return an empty array if there is no user
    if (!currentUser || !currentUser.userId) {
      return []
    }


    const workflows = await ctx.db
      .query("workflows")
      .withIndex("by_user", (q) => q.eq("userId", currentUser.userId as Id<"users">))
      .order("desc")
      .collect();

    return workflows.map(({ content, userId, ...rest }) => ({
      ...rest,
    }));
  },
});
