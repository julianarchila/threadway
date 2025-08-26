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
            throw new Error("User not authenticated");
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
        if (!term) {
            return [];
        }

        // Get all integrations for the user
        const integrations = await ctx.db
            .query("integrations")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .collect();

        // Filter integrations by search term
        const filteredIntegrations = integrations.filter((integration) =>
            integration.name.toLowerCase().includes(term.toLowerCase())
        );

        // Return only the necessary fields
        return filteredIntegrations.map((integration) => ({
            _id: integration._id,
            name: integration.name,
            mcpUrl: integration.mcpUrl,
        }));
    },
});
