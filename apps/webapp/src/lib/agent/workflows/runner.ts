import * as ai from "ai";
import { stepCountIs, type ModelMessage } from "ai";
import { initLogger, wrapAISDK } from "braintrust";
import { err, ok, Result } from "neverthrow";
import type { Id } from "@threadway/backend/convex/dataModel";
import { appendMessages } from "@/lib/agent/state/api";
import { composio } from "@/lib/composio";
import type { WorkflowWithIntegrations } from "@/lib/agent/state/workflows";
import { AgentError } from "@/lib/agent/core/errors";

if (process.env.BRAINTRUST_API_KEY) {
  initLogger({
    projectName: process.env.BRAINTRUST_PROJECT_NAME || "Threadway",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });
}

const { generateText } = wrapAISDK(ai);

export async function runWorkflow(params: {
  userId: Id<"users">;
  workflow: WorkflowWithIntegrations;
  threadId: Id<"thread">;
  history: ModelMessage[];
  userInput: string;
}): Promise<Result<string, AgentError>> {
  try {
    const toolkits = params.workflow.toolkitSlugs;

    if (toolkits.length === 0) {
      console.log("[workflow] no toolkits required for workflow", { workflowId: params.workflow._id, title: params.workflow.title });
    } else {
      console.log("[workflow] loading tools for workflow", { workflowId: params.workflow._id, title: params.workflow.title, toolkits, limit: 20 });
    }

    const toolset = toolkits.length
      ? await composio.tools.get(params.userId, { toolkits, limit: 20 })
      : {};

    const toolNames = Object.keys(toolset || {});
    console.log("[workflow] loaded tools", { count: toolNames.length, names: toolNames.slice(0, 20) });

    const system = buildWorkflowSystemPrompt(params.workflow);
    const messages: ModelMessage[] = [
      ...params.history,
      { role: "user", content: params.userInput },
    ];

    const result = await generateText({
      model: ai.gateway("anthropic/claude-sonnet-4.5"),
      messages,
      system,
      tools: toolset,
      stopWhen: stepCountIs(10),
    });

    await appendMessages({
      userId: params.userId,
      threadId: params.threadId,
      msgs: result.response.messages,
      status: "success",
    });

    return ok(result.text ?? "");
  } catch (e) {
    return err(new AgentError("FAILED_TO_GENERATE_TEXT", "Workflow execution failed", e));
  }
}

function buildWorkflowSystemPrompt(workflow: WorkflowWithIntegrations): string {
  const header = `You are Threadway, a WhatsApp automation agent. You will have acess to a list of tools that correspond to external services the end user has given you acess to. You will use these tools to complete the workflow you have to run. Here you can see the workflow title, the workflow content (what the user wants to do) and the chat history is part of the conversation so you can understand the context of the conversation. Execute the selected workflow faithfully and produce concise, WhatsApp-friendly responses.`;

  const title = `Workflow: ${workflow.title}`;
  const content = workflow.content || "";
  const guidelines = `Guidelines:\n- Keep outputs short and actionable.\n- If a required connection is missing at runtime, explain what is needed.\n- Prefer structured bullet points when listing results.`;
  return [header, title, content, guidelines].join("\n\n");
}


