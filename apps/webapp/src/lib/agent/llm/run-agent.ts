import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { ModelMessage } from "ai";

type ToolSet = Record<string, unknown>;

export async function runAgent(params: {
  systemPrompt: string;
  history: ModelMessage[];
  userInput: string;
  tools?: ToolSet;
}): Promise<string> {
  const messages: ModelMessage[] = [
    ...params.history,
    { role: "user", content: params.userInput },
  ];

  try {
    const result = await generateText({
      model: openai("gpt-4.1"),
      messages: messages as any,
      system: params.systemPrompt,
      tools: params.tools as any,
    });
    return result.text ?? "";
  } catch (err: any) {
    // Workaround: Some tool schemas use an incompatible Zod version; retry without tools.
    const msg = typeof err?.message === "string" ? err.message : "";
    const isZodShapeError = msg.includes("def.shape is not a function");
    if (!isZodShapeError) throw err;

    const result = await generateText({
      model: openai("gpt-4.1"),
      messages: messages as any,
      system: params.systemPrompt,
    });
    return result.text ?? "";
  }
}


