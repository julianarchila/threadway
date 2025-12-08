import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Internal mutation to update Kapso customer ID
 */
export const updateKapsoCustomerId = internalMutation({
  args: v.object({
    userId: v.id("users"),
    kapsoCustomerId: v.string(),
  }),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      kapsoCustomerId: args.kapsoCustomerId,
    });
  },
});

/**
 * Update user's WhatsApp connection details after successful setup
 * This should be called from the webhook handler
 */
export const updateWhatsAppConnection = internalMutation({
  args: v.object({
    userId: v.id("users"),
    phoneNumberId: v.string(),
    phoneNumber: v.optional(v.string()),
    connectionType: v.union(v.literal("coexistence"), v.literal("dedicated")),
    wabaId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if this phone number is already connected
    const existing = await ctx.db
      .query("connectedNumbers")
      .withIndex("by_phone_number_id", (q) =>
        q.eq("phoneNumberId", args.phoneNumberId)
      )
      .first();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        status: "active" as const,
        connectionType: args.connectionType,
        phoneNumber: args.phoneNumber,
        wabaId: args.wabaId,
      });

      return { success: true, connectedNumberId: existing._id };
    }

    // Create new connected number
    const connectedNumberId = await ctx.db.insert("connectedNumbers", {
      userId: args.userId,
      phoneNumberId: args.phoneNumberId,
      phoneNumber: args.phoneNumber,
      connectionType: args.connectionType,
      wabaId: args.wabaId,
      status: "active",
      connectedAt: Date.now(),
    });

    return { success: true, connectedNumberId };
  },
});
