import { query } from "../_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "../auth";
import { Id } from "../_generated/dataModel";

// Obtener workflow por ID
export const getWorkflowById = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, { workflowId }) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
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
export const getWorkflowsByUser = query({
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }

    return await ctx.db
      .query("workflows")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .order("desc")
      .collect();
  },
}); 