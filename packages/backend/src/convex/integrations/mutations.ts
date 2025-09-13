import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";
import { IntegrationsError } from "./error";
import { internal } from "../_generated/api";

// =============================================================================
// Public Mutations
// =============================================================================

/**
 * Deletes a connection for the authenticated user.
 *
 * @param connectionId - The ID of the connection to delete.
 * @throws {IntegrationsError} If the user is not authenticated, the connection is not found,
 * or the user does not have permission to delete the connection.
 * @returns An object indicating the success of the operation.
 */
export const deleteConnection = mutation({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.safeGetAuthUser(ctx);
    if (!currentUser) {
      throw new IntegrationsError(
        "INTEGRATION_DELETION_FAILED",
        "User not authenticated"
      );
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new IntegrationsError(
        "INTEGRATION_DELETION_FAILED",
        "Connection not found"
      );
    }

    if (connection.userId !== currentUser.userId) {
      throw new IntegrationsError(
        "INTEGRATION_DELETION_FAILED",
        "You do not have permissions to delete this connection"
      );
    }

    await ctx.db.delete(args.connectionId);

    // Remove the connection from Composio asynchronously
    await ctx.scheduler.runAfter(
      0,
      internal.integrations.actions.deleteComposioConnection,
      {
        connectionId: connection.connectionId,
      }
    );

    return {
      success: true,
      message: "Connection deleted successfully",
    };
  },
});

// =============================================================================
// Internal Mutations
// =============================================================================

/**
 * Creates a pending connection record in the database.
 * This is used to track the connection process before it becomes active.
 *
 * @param connectionId - The unique identifier for the connection from the external service.
 * @param userId - The ID of the user initiating the connection.
 * @param authConfigId - The ID of the authentication configuration used.
 */
export const createPendingConnection = internalMutation({
  args: {
    connectionId: v.string(),
    userId: v.id("users"),
    authConfigId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("connections", {
      status: "INITIATED",
      authConfigId: args.authConfigId,
      userId: args.userId,
      connectionId: args.connectionId,
    });
  },
});

/**
 * Marks a pending connection as active.
 * This is called after the external service confirms the connection is successful.
 *
 * @param connectionId - The unique identifier for the connection.
 * @param toolkitSlug - The slug for the toolkit associated with this connection.
 * @throws {IntegrationsError} If the connection is not found.
 */
export const markConnectionAsActive = internalMutation({
  args: {
    connectionId: v.string(),
    toolkitSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const conn = await ctx.db
      .query("connections")
      .withIndex("by_connectionId", (q) =>
        q.eq("connectionId", args.connectionId)
      )
      .first();

    if (!conn) {
      throw new IntegrationsError(
        "INTEGRATION_LOOKUP_FAILED",
        "Connection not found"
      );
    }

    await ctx.db.patch(conn._id, {
      status: "ACTIVE",
      toolkitSlug: args.toolkitSlug,
    });
  },
});

/**
 * Removes a connection record from the database.
 * This is typically used to clean up failed or incomplete connection attempts.
 *
 * @param connectionId - The unique identifier for the connection to remove.
 * @throws {IntegrationsError} If the connection is not found.
 */
export const removeFailedConnection = internalMutation({
  args: {
    connectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const conn = await ctx.db
      .query("connections")
      .withIndex("by_connectionId", (q) =>
        q.eq("connectionId", args.connectionId)
      )
      .first();

    if (!conn) {
      throw new IntegrationsError(
        "INTEGRATION_LOOKUP_FAILED",
        "Connection not found"
      );
    }

    await ctx.db.delete(conn._id);
  },
});
