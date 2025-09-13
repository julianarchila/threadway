import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { validatePhoneNumber } from "./utils";

export const findOrCreateUser = async (ctx: ActionCtx, phoneNumber: string) => {
  const validatedPhoneNumber = validatePhoneNumber(phoneNumber);
  if (validatedPhoneNumber.isErr()) {
    throw validatedPhoneNumber.error;
  }

  let user = await ctx.runQuery(internal.user.queries.getUserByPhoneNumber, { phoneNumber: validatedPhoneNumber.value });
  if (user) return user;

  await ctx.runMutation(internal.auth.createUser, {
    input: {
      model: "user",
      data: {
        phoneNumber: validatedPhoneNumber.value,
        name: validatedPhoneNumber.value,
        email: `${validatedPhoneNumber.value}@temp.local`,
        emailVerified: false,
        phoneNumberVerified: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    }
  })

  user = await ctx.runQuery(internal.user.queries.getUserByPhoneNumber,
    { phoneNumber: validatedPhoneNumber.value }
  );

  if (!user) throw new Error("User should exist after creation");
  return user;
}

/* 
Use this function to get the user given the phoneNumber from the chat webhook 
*/

export const findChatUser = async (ctx: ActionCtx, phoneNumber: string) => {
  const validatedPhoneNumber = validatePhoneNumber(phoneNumber);
  if (validatedPhoneNumber.isErr()) {
    throw validatedPhoneNumber.error;
  }

  let user = await ctx.runQuery(internal.user.queries.getUserByPhoneNumber, { phoneNumber: validatedPhoneNumber.value });
  return user

}
