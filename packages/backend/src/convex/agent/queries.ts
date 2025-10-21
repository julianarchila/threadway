
import { query } from "../_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "../auth";
import type { Id } from "../_generated/dataModel";

const SUPER_SECRET = "temp-secret"

export const getUserByPhoneNumber = query({
  args: v.object({
    phoneNumber: v.string(),
    secret: v.string()
  }),
  handler: async (ctx, args) => {

    if (SUPER_SECRET !== args.secret) {
      throw new Error("GET AWAY")
    }

    console.debug("Looking for user with phone number:", args.phoneNumber)

    return ctx.db.query("users")
      .withIndex("by_phone_number", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first()

  }
})
