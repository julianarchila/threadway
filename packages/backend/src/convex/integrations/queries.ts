import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { betterAuthComponent } from "../auth";
import { IntegrationsError } from "./error";

// Query to get the authenticated user's integrations
export const getMyIntegrations = query({
    args: {},
    handler: async (ctx) => {
        const userId = await betterAuthComponent.getAuthUserId(ctx);
        if (!userId) {
            throw new IntegrationsError("INTEGRATION_QUERY_FAILED", "Unauthorized");
        }

        // Get all integrations for the user
        const integrations = await ctx.db
            .query("integrations")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .collect();

        // Return only the necessary fields
        return integrations.map((integration) => ({
            _id: integration._id,
            name: integration.name,
            mcpUrl: integration.mcpUrl,
        }));
    },
});

// Query to search for integrations by name (only the user's integrations)
export const searchMyIntegrations = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        const userId = await betterAuthComponent.getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User not authenticated");
        }

        const term = args.searchTerm.trim();
        if (term.length < 2) {
            return [];
        }

        // Get all integrations for the user
        const integrations = await ctx.db
            .query("integrations")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .collect();

        // Filter integrations by search term
        const filteredIntegrations = integrations
            .filter((integration) =>
                integration.name.toLowerCase().includes(term.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 50)

        // Return only the necessary fields
        return filteredIntegrations.map((integration) => ({
            _id: integration._id,
            name: integration.name,
            mcpUrl: integration.mcpUrl,
        }));
    },
});


// const {TOOLKIT_AUTH_CONFIG} = import("../../lib/composio/connections");
import { TOOLKIT_AUTH_CONFIG } from "../../lib/composio/connections";
import { internalQuery } from "../_generated/server";
export const listAvailableIntegrations = query({
  handler: async (ctx) => {
    // Convert Map to array structure
    return Array.from(TOOLKIT_AUTH_CONFIG.entries()).map(([name, authConfigId]) => ({
      name,
      authConfigId
    }));
  }
})


export const getUserConnectionByAuthConfigId = internalQuery({
  args: { authConfigId: v.string(), userId: v.id("users") },
  handler: async (ctx, args ) => {

    return await ctx.db.query("connections")
      .withIndex("by_authConfigId_and_user", (q) => q.eq("authConfigId", args.authConfigId).eq("userId", args.userId))
      .first()



  }
})
