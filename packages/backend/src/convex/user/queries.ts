import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { validatePhoneNumber } from "./utils";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";


export const getUserByPhoneNumber = internalQuery({
  args: v.object({
    phoneNumber: v.string(),
  }),
  handler: async (ctx, args) => {
    const validatedPhoneNumber = validatePhoneNumber(args.phoneNumber);

    if (validatedPhoneNumber.isErr()) {
      throw validatedPhoneNumber.error;

    }

    return ctx.db.query("users")
      .withIndex("by_phone_number", (q) => q.eq("phoneNumber", validatedPhoneNumber.value))
      .first()

  }
})

// Query to get the current user's phone number
export const phoneNumber = query({
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the user from our custom table
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      // User doesn't exist in our custom table but is authenticated in Better Auth
      // This indicates a synchronization issue
      return "";
    }

    return user.phoneNumber;
  }
})
