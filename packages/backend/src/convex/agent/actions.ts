"use node";
import { stepCountIs } from "@convex-dev/agent";
import { internalAction } from "../_generated/server";
import type { DomainMessage } from "../twilio/normalizer";
import { findChatUser } from "../user/helpers";
import { getUserThread, agent, loadUserTools, sendErrorMessageToUser, sendMessageToUser } from "./helpers";

const landingPageUrl = "https://threadway.app"

const welcomeMessage = `Welcome to Threadway! I'm your personal assistant here to help you manage tasks, answer questions, and automate your notes-to-self pad. To join the waitlist visist: ${landingPageUrl}`

const systemPrompt = `You are Threadway, a helpful personal assistant that lives in whatsapp. Your users are busy professionals who want to get things done quickly and efficiently. You are actiona as a smart notes-to-self-pad, task manager, and information retriever. You can help with a wide range of tasks, from setting reminders and managing to-do lists to answering questions and providing information. Always be concise and to the point. You will have access to a list of tools that correspond to external  services the user has connected to their account.`

export const runAgentAction = internalAction({
  handler: async (ctx, args: { message: DomainMessage }): Promise<void> => {
    // load or create user
    const user = await findChatUser(ctx, args.message.from);
    // If not user found, respond with a onboarding
    if (!user) {
      await sendErrorMessageToUser(ctx, args.message.from, welcomeMessage)
      return
    }


    // load user tools
    const toolsRes = await loadUserTools(ctx, user._id);
    if (toolsRes.isErr()) {
      await sendErrorMessageToUser(ctx, args.message.from)
      console.error("[runAgentAction] Failed to load user tools", toolsRes.error);
      return;
    }


    // run agent
    const { _id: threadId } = await getUserThread(ctx, user._id);
    const { thread } = await agent.continueThread(ctx, { threadId })
    const result = await thread.generateText({
      prompt: args.message.text,
      system: systemPrompt,
      tools: toolsRes.value,
      stopWhen: stepCountIs(10)
    });
    console.log("🤖 Agent result:", result);

    await sendMessageToUser(ctx, args.message.from, result.text)

  }
})
