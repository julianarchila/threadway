
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


    return ctx.db.query("users")
      .withIndex("by_phone_number", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first()

  }
})
