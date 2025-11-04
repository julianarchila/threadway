import { stepCountIs } from "ai";
import * as ai from "ai";
import { openai } from "@ai-sdk/openai";
import type { ModelMessage } from "ai";
import { loadUserTools } from "@/agent/data";
import { Id } from "@threadway/backend/convex/dataModel";

import { initLogger, wrapAISDK } from "braintrust";
import { appendMessages } from "@/lib/agent/state/api";


import { kapsoChannel } from "@/lib/agent/channel";
import { NonRetriableError } from "inngest";

const genericChatErrorMessage = `Sorry, I encountered an error while processing your request. Please try again later.`

// `initLogger` sets up your code to log to the specified Braintrust project using your API key.
// By default, all wrapped models will log to this project. If you don't call `initLogger`, then wrapping is a no-op, and you will not see spans in the UI.
initLogger({
  projectName: "My Project",
  apiKey: process.env.BRAINTRUST_API_KEY,
});

const { generateText } = wrapAISDK(ai);


export async function runAgent(params: {
  systemPrompt: string;
  history: ModelMessage[];
  userInput: string;
  userId: Id<"users">;
  from: string;
  threadId: Id<"thread">;
}): Promise<string> {

  console.log("params: ", params)

  const toolsRes = await loadUserTools(params.userId)
  if (toolsRes.isErr()) {
    await kapsoChannel.sendText(params.from, genericChatErrorMessage)
    throw new NonRetriableError("failed to load user tools", toolsRes.error)
  }
  const messages: ModelMessage[] = [
    ...params.history,
    { role: "user", content: params.userInput },
  ];


  const result = await generateText({
    model: openai("gpt-5-mini"),
    messages: messages,
    system: params.systemPrompt,
    tools: toolsRes.value,
    stopWhen: stepCountIs(10),
    onStepFinish: async (step) => {
      await appendMessages({
        userId: params.userId,
        threadId: params.threadId,
        msgs: step.response.messages,
        status: "success",
      });
    }
  });

  result.content
  return result.text ?? "";
}


