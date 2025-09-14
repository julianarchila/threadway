"use node";

import { components, internal } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import type { ActionCtx } from "../_generated/server";
import { openai } from "@ai-sdk/openai";
import type { Id } from "../_generated/dataModel";

import { fromAsyncThrowable, err, ok } from "neverthrow";
import { composio } from "../../lib/composio";
import { AgentError } from "./error";
import { sendWhatsappMessage } from "../twilio/utils";


export const agent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: openai("gpt-5"),
  textEmbeddingModel: openai.textEmbeddingModel("text-embedding-3-large")
});



// We will have a unique thread for each user
export const getUserThread = async (ctx: ActionCtx, userId: Id<"users">) => {
  // search for thread with user id
  // if not found, create a new thread

  const threadsQueryRes = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
    userId, paginationOpts: {
      numItems: 1,
      cursor: null,
    }
  });
  const existingThread = threadsQueryRes.page.length > 0 ? threadsQueryRes.page[0] : null;

  if (existingThread) return existingThread;

  // create a new thread
  const newThread = await ctx.runMutation(components.agent.threads.createThread, {
    userId,
    defaultSystemPrompt: "You are Threadway, a helpful personal assistant that lives in whatsapp."
  });
  return newThread;
}


export const loadUserTools = async (ctx: ActionCtx, userId: Id<"users">) => {
  // const userToolKits = await internal.integrations.queries.getUserConnectedToolkits({userId: args.userId})
  const userToolKits = await ctx.runQuery(internal.integrations.queries.getUserConnectedToolkits, { userId: userId })
  console.debug("[loadUserTools]: User toolkits: ", userToolKits)

  if (userToolKits.length === 0) {
    return ok({});
  }

  // Fetch top 10 tools per toolkit in parallel
  const perToolkitFetches = userToolKits.map((toolkit) =>
    fromAsyncThrowable(() =>
      composio.tools.get(userId, { toolkits: [toolkit], limit: 20 })
    )()
  );

  const perToolkitResults = await Promise.all(perToolkitFetches);

  // Collect successes and merge ToolSets
  const successfulToolSets = perToolkitResults
    .filter((r) => r.isOk())
    .map((r) => r.value);

  const mergedToolSet = successfulToolSets.reduce(
    (acc, set) => ({ ...acc, ...set }),
    {}
  );

  if (Object.keys(mergedToolSet).length > 0) {
    return ok(mergedToolSet);
  }

  // If all requests failed, bubble up the first error
  const firstError = perToolkitResults.find((r) => r.isErr())?.error;
  return err(
    new AgentError(
      "FAILED_TO_LOAD_TOOLS",
      "Failed too load user tools from composio",
      firstError
    )
  )

}


const genericChatErrorMessage = `Sorry, I encountered an error while processing your request. Please try again later.`



export const sendMessageToUser = async (ctx: ActionCtx, phoneNumber: string, message: string) => {
  // We might implement routing later for different message channels, ej: Whatsapp, SMS, iMessage, etc.

  // send message to user via twilio
  return sendWhatsappMessage(phoneNumber, message)


}


export const sendErrorMessageToUser = async (ctx: ActionCtx, phoneNumber: string, errorMessage?: string) => {

  const message = errorMessage || genericChatErrorMessage

  return sendMessageToUser(ctx, phoneNumber, message)

}
