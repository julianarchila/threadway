import { stepCountIs } from "ai";
import * as ai from "ai";
import { openai } from "@ai-sdk/openai";
import type { ModelMessage } from "ai";
import { loadUserTools } from "@/agent/data";
import { Id } from "@threadway/backend/convex/dataModel";

import { initLogger, wrapAISDK } from "braintrust";
import { appendMessages } from "@/lib/agent/state/api";
import { AgentError } from "@/lib/agent/core/errors";
import { err, ok, Result } from "neverthrow";

// `initLogger` sets up your code to log to the specified Braintrust project using your API key.
// By default, all wrapped models will log to this project. If you don't call `initLogger`, then wrapping is a no-op, and you will not see spans in the UI.
if (process.env.BRAINTRUST_API_KEY) {
  initLogger({
    projectName: process.env.BRAINTRUST_PROJECT_NAME || "Threadway",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });
}

const { generateText } = wrapAISDK(ai);


export async function runAgent(params: {
  systemPrompt: string;
  history: ModelMessage[];
  userInput: string;
  userId: Id<"users">;
  from: string;
  threadId: Id<"thread">;
}): Promise<Result<string, AgentError>> {


  const toolsRes = await loadUserTools(params.userId)
  if (toolsRes.isErr()) {
    return err(toolsRes.error)
  }
  const messages: ModelMessage[] = [
    ...params.history,
    { role: "user", content: params.userInput },
  ];


  try {
    const result = await generateText({
      model: ai.gateway("openai/gpt-5"),
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
    return ok(result.text ?? "");
  } catch (e) {
    console.error("Error during text generation:", e);
    return err(new AgentError("FAILED_TO_GENERATE_TEXT", "Text generation failed", e));
  }
}


