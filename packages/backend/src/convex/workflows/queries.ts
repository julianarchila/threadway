import { query } from "../_generated/server";
import { v } from "convex/values";

// Obtener workflow por ID
export const getWorkflowById = query({
  args: { workflowId: v.string() },
  handler: async (ctx, { workflowId }) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_workflow_id", (q) => q.eq("workflowId", workflowId))
      .first();
  },
});

// Obtener todos los workflows de un usuario
export const getWorkflowsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
}); 