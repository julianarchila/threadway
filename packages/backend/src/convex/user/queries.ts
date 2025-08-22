import { internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { validatePhoneNumber } from "./utils";


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
