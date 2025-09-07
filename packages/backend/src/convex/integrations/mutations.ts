import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { betterAuthComponent } from "../auth";
import { IntegrationsError } from "./error";

import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";



export const deleteConnection = mutation({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, args) => {

    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
        throw new IntegrationsError("INTEGRATION_DELETION_FAILED", "User not authenticated")
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new IntegrationsError(
        "INTEGRATION_DELETION_FAILED",
        "Connection not found"
      );
    }

    if (connection.userId !== userId) {
      throw new IntegrationsError(
        "INTEGRATION_DELETION_FAILED",
        "You do not have permissions to delete this connection"
      );
    }
    await ctx.db.delete(args.connectionId);

    // We should remove the connection from Composio as well
    await ctx.scheduler.runAfter(0, internal.integrations.actions.deleteComposioConnection, {
      connectionId: connection.connectionId,
    },
    )

    return {
      success: true,
      message: "Connection deleted successfully",
    };

  }
})


export const creteInitialConnection = internalMutation({
  args: {
    connectionId: v.string(),
    userId: v.id("users"),
    authConfigId: v.string(),
  },
  handler: async (ctx, args) => {

    ctx.db.insert("connections", {
      status: "INITIATED",
      authConfigId: args.authConfigId,
      userId: args.userId,
      connectionId: args.connectionId,
    })

  }
})


export const successfulConnection = internalMutation({
  args: {
    connectionId: v.string(),
    tolkitSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const conn = await ctx.db.query("connections")
      .withIndex("by_connectionId", (q) => q.eq("connectionId", args.connectionId))
      .first()

    if (!conn) {
      throw new Error("Connection not found")
    }

    await ctx.db.patch(conn._id, {
      status: "ACTIVE",
      tolkitSlug: args.tolkitSlug,
    })
  }
})
