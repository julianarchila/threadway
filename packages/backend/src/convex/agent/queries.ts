
import { query } from "../_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

const SUPER_SECRET = process.env.AGENT_SECRET

export const getUserByPhoneNumber = query({
  args: v.object({
    phoneNumber: v.string(),
    secret: v.string()
  }),
  handler: async (ctx, args) => {

    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope")
    }

    console.log("Looking up user by phone number:", args.phoneNumber)


    return ctx.db.query("users")
      .withIndex("by_phone_number", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first()

  }
})


export const getUserConnectedToolkits = query({
  args: { userId: v.id("users"), secret: v.string() },
  handler: async (ctx, args) => {

    if (SUPER_SECRET !== args.secret) {
      throw new Error("Nope")
    }

    const connections = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "ACTIVE"))
      .collect();

    return connections.map((c) => c.toolkitSlug).filter((s): s is string => typeof s === "string");
  }
})
