import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { betterAuthComponent } from "../auth";
import { listAvailableIntegrations as listAvailableIntegrationsLib } from "../../lib/composio/connections";

// =============================================================================
// Public Queries
// =============================================================================

/**
 * Returns the list of available integrations for the current environment.
 * Only integrations with an authConfigId configured for the active env are returned.
 * Shape: { slug, authConfigId, displayName?, iconKey?, description? }
 */
export const listAvailableIntegrations = query({
  handler: async (_ctx) => {
    return listAvailableIntegrationsLib();
  },
});

export const listUserConnections = query({
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const connections = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .filter((q) => q.eq(q.field("status"), "ACTIVE"))
      .collect();

    return connections.map((c) => ({
      _id: c._id,
      authConfigId: c.authConfigId,
      connectionId: c.connectionId,
      toolkitSlug: c.toolkitSlug,
      name: c.toolkitSlug ? c.toolkitSlug.toUpperCase() : "UNKNOWN",
      status: c.status,
    }));
  },
});

// =============================================================================
// Internal Queries
// =============================================================================

export const getUserConnectionByAuthConfigId = internalQuery({
  args: { authConfigId: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("connections")
      .withIndex("by_authConfigId_and_user", (q) =>
        q.eq("authConfigId", args.authConfigId).eq("userId", args.userId)
      )
      .first();
  },
});