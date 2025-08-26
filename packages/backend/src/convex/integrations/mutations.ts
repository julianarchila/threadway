import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { betterAuthComponent } from "../auth";
import { IntegrationsError } from "./error";

import { z } from "zod";

// URL validation schema
const urlSchema = z.string().url("Invalid URL format");

// Mutation to create a new integration
export const create = mutation({
    args: {
        name: v.string(),
        mcpUrl: v.string(),
        apiKey: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await betterAuthComponent.getAuthUserId(ctx)
        if (!userId) {
            throw new Error("User not authenticated")
        }

        // Normalize and validate inputs
        const name = args.name.trim();
        const mcpUrl = args.mcpUrl.trim();
        const apiKey = typeof args.apiKey === "string" ? args.apiKey.trim() : undefined;

        if (!name) {
            throw new IntegrationsError(
                "INTEGRATION_CREATION_FAILED",
                "Integration name is required"
            );
        }

        if (!mcpUrl) {
            throw new IntegrationsError(
                "INTEGRATION_CREATION_FAILED",
                "MCP URL is required"
            );
        }

        // Validate URL using zod
        const urlValidation = urlSchema.safeParse(mcpUrl);
        if (!urlValidation.success) {
            throw new IntegrationsError(
                "INTEGRATION_CREATION_FAILED",
                "Invalid MCP URL format"
            );
        }

        // Check if integration with same name already exists
        const existingIntegration = await ctx.db
            .query("integrations")
            .withIndex("by_user_nameLower", (q) =>
                q.eq("userId", userId as Id<"users">).eq("nameLower", name.toLowerCase())
            )
            .first();

        if (existingIntegration) {
            throw new IntegrationsError(
                "INTEGRATION_CREATION_FAILED",
                "You already have an integration with this name"
            );
        }

        // Create the integration
        const integrationId = await ctx.db.insert("integrations", {
            userId: userId as Id<"users">,
            name,
            nameLower: name.toLowerCase(),
            mcpUrl,
            apiKey: apiKey || "",
        });

        return integrationId;
    },
});

// Mutation to delete an integration
export const deleteIntegration = mutation({
    args: { integrationId: v.id("integrations") },
    handler: async (ctx, args) => {
        const userId = await betterAuthComponent.getAuthUserId(ctx)
        if (!userId) {
            throw new Error("User not authenticated")
        }

        // Get the integration to verify ownership
        const integration = await ctx.db.get(args.integrationId);
        if (!integration) {
            throw new IntegrationsError(
                "INTEGRATION_DELETION_FAILED",
                "Integration not found"
            );
        }

        // Check if user owns this integration
        if (integration.userId !== userId) {
            throw new IntegrationsError(
                "INTEGRATION_DELETION_FAILED",
                "You do not have permissions to delete this integration"
            );
        }

        // Delete the integration
        await ctx.db.delete(args.integrationId);

        return {
            success: true,
            message: "Integration deleted successfully",
        };
    },
});
