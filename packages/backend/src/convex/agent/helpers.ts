
import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import type { ActionCtx } from "../_generated/server";
import { openai } from "@ai-sdk/openai";
import type { Id } from "../_generated/dataModel";


export const agent = new Agent(components.agent, {
    name: "My Agent",
    languageModel: openai("gpt-4o"),
});



// We will have a unique thread for each user
export const getUserThread = async (ctx: ActionCtx, userId: Id<"users">) => {
    // search for thread with user id
    // if not found, create a new thread

    const threadsQueryRes = await ctx.runQuery(components.agent.threads.listThreadsByUserId, { userId, paginationOpts: {
        numItems: 1,
        cursor: null,
    } });
    const existingThread = threadsQueryRes.page.length > 0 ? threadsQueryRes.page[0] : null;

    if (existingThread) return existingThread;

    // create a new thread
    const newThread = await ctx.runMutation(components.agent.threads.createThread, {
        userId,
        defaultSystemPrompt: "You are Threadway, a helpful personal assistant that lives in whatsapp."
    });
    return newThread;
}

