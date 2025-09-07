import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { betterAuthComponent } from "../auth";
import { IntegrationsError } from "./error";

import { z } from "zod";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

// URL validation schema
const urlSchema = z
    .string()
    .url("Invalid URL format")
    .refine((u) => {
        try {
            const p = new URL(u).protocol;
            return p === "https:" || p === "http:";
        } catch {
            return false;
        }
    }, "URL must use http or https");

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
            throw new IntegrationsError("INTEGRATION_CREATION_FAILED", "User not authenticated")
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
            throw new IntegrationsError("INTEGRATION_DELETION_FAILED", "User not authenticated")
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
