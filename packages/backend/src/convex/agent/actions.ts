import { internalAction } from "../_generated/server";
import type { DomainMessage } from "../twilio/normalizer";
import { findOrCreateUser, findChatUser } from "../user/helpers";
import { getUserThread, agent } from "./helpers";

const landingPageUrl = "https://threadway.app"

const welcomeMessage = `Welcome to Threadway! I'm your personal assistant here to help you manage tasks, answer questions, and automate your notes-to-self pad. To join the waitlist visist: ${landingPageUrl}`

export const runAgentAction = internalAction({
  handler: async (ctx, args: { message: DomainMessage }): Promise<string> => {
    // load or create user
    const user = await findChatUser(ctx, args.message.from);
    // If not user found, respond with a onboarding
    if (!user) return welcomeMessage


    // run agent
    const { _id: threadId } = await getUserThread(ctx, user._id);
    const { thread } = await agent.continueThread(ctx, { threadId })
    const result = await thread.generateText({ prompt: args.message.text });
    console.log("🤖 Agent result:", result);

    return result.text
  }
})
