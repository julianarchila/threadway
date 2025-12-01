import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Internal helper to get user by ID
 */
export const getUser = internalQuery({
  args: v.object({
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});

/**
 * Internal helper to find user by Kapso customer ID
 */
export const getUserByKapsoCustomerId = internalQuery({
  args: v.object({
    kapsoCustomerId: v.string(),
  }),
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_kapso_customer_id", (q) =>
        q.eq("kapsoCustomerId", args.kapsoCustomerId)
      )
      .first();
  },
});
