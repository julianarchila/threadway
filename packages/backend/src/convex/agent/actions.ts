import { internalAction } from "../_generated/server";
import type { DomainMessage } from "../twilio/normalizer";
import { findOrCreateUser } from "../user/helpers";
import { getUserThread, agent } from "./helpers";

export const runAgentAction = internalAction({
    handler: async (ctx, args: { message: DomainMessage }): Promise<string> => {
        // load or create user
        const user = await findOrCreateUser(ctx, args.message.from);
        console.log("👤 User loaded:", user);
        // run agent
        const {_id: threadId}= await getUserThread(ctx, user._id);
        const {thread} = await agent.continueThread(ctx, {threadId})
        const result = await thread.generateText({ prompt: args.message.text});
        console.log("🤖 Agent result:", result);

        return result.text
    }
})