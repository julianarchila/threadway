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
  const toolsRes = await fromAsyncThrowable(() => composio.tools.get(userId, {
    toolkits: userToolKits
  }))()

  if (toolsRes.isErr()) return err(new AgentError(
    "FAILED_TO_LOAD_TOOLS",
    "Failed too load user tools from composio",
    toolsRes.error
  ))



  return ok(toolsRes.value)

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
