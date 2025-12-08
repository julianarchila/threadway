import { v } from "convex/values";
import { query } from "../_generated/server";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

/**
 * Get all WhatsApp numbers connected by the current user
 */
export const getConnectedNumbers = query({
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const connectedNumbers = await ctx.db
      .query("connectedNumbers")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId as Id<"users">).eq("status", "active")
      )
      .collect();

    return connectedNumbers;
  },
});

/**
 * Get WhatsApp connection status for the current user
 * Returns the first active connection (for backward compatibility)
 */
export const getWhatsAppConnectionStatus = query({
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      return null;
    }

    // Get first active connection
    const connection = await ctx.db
      .query("connectedNumbers")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId as Id<"users">).eq("status", "active")
      )
      .first();

    if (!connection) {
      return {
        isConnected: false,
        kapsoCustomerId: user.kapsoCustomerId,
      };
    }

    return {
      isConnected: true,
      phoneNumberId: connection.phoneNumberId,
      phoneNumber: connection.phoneNumber,
      connectionType: connection.connectionType,
      connectedAt: connection.connectedAt,
      kapsoCustomerId: user.kapsoCustomerId,
    };
  },
});

/**
 * Check if user has a Kapso customer ID
 */
export const hasKapsoCustomer = query({
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const user = await ctx.db.get(userId as Id<"users">);
    return !!user?.kapsoCustomerId;
  },
});
