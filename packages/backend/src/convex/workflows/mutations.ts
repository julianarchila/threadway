import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { 
  createWorkflowCreationError, 
  createWorkflowNotFoundError, 
  createWorkflowUpdateError,
  createUserNotAuthorizedError,
  createContentTooLongError,
  createInvalidUserIdError,
  createInvalidWorkflowIdError
} from "./error";

// Constantes
const MAX_CONTENT_LENGTH = 100000; // 100KB

// Crear nuevo workflow
export const createWorkflow = mutation({
  args: {
    workflowId: v.string(),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      // Validaciones
      if (!args.workflowId.trim()) {
        throw createInvalidWorkflowIdError(args.workflowId);
      }

      if (args.content.length > MAX_CONTENT_LENGTH) {
        throw createContentTooLongError(MAX_CONTENT_LENGTH);
      }

      // Verificar que el usuario existe
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw createInvalidUserIdError(args.userId);
      }

      const now = Date.now();
      return await ctx.db.insert("workflows", {
        workflowId: args.workflowId,
        content: args.content,
        userId: args.userId,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'WorkflowError') {
        throw error;
      }
      throw createWorkflowCreationError(args.workflowId, error);
    }
  },
});

// Actualizar workflow existente
export const updateWorkflow = mutation({
  args: {
    workflowId: v.string(),
    content: v.string(),
    userId: v.optional(v.id("users")), // Opcional para verificar autorización
  },
  handler: async (ctx, { workflowId, content, userId }) => {
    try {
      // Validaciones
      if (!workflowId.trim()) {
        throw createInvalidWorkflowIdError(workflowId);
      }

      if (content.length > MAX_CONTENT_LENGTH) {
        throw createContentTooLongError(MAX_CONTENT_LENGTH);
      }

      // Buscar el workflow
      const workflow = await ctx.db
        .query("workflows")
        .withIndex("by_workflow_id", (q) => q.eq("workflowId", workflowId))
        .first();
      
      if (!workflow) {
        throw createWorkflowNotFoundError(workflowId);
      }

      // Verificar autorización si se proporciona userId
      if (userId && workflow.userId !== userId) {
        throw createUserNotAuthorizedError(userId, workflowId);
      }
      
      await ctx.db.patch(workflow._id, {
        content,
        updatedAt: Date.now(),
      });
      
      return workflow._id;
    } catch (error) {
      if (error instanceof Error && error.name === 'WorkflowError') {
        throw error;
      }
      throw createWorkflowUpdateError(workflowId, error);
    }
  },
}); 