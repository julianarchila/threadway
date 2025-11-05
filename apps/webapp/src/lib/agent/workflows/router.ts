import * as ai from "ai";
import { stepCountIs, type ModelMessage } from "ai";
import { initLogger, wrapAISDK } from "braintrust";
import { z } from "zod";
import { err, ok, Result } from "neverthrow";
import type { Id } from "@threadway/backend/convex/dataModel";
import { listUserWorkflowsWithIntegrations, type WorkflowWithIntegrations } from "@/lib/agent/state/workflows";
import { convexClient } from "@/lib/convex";
import { api } from "@threadway/backend/convex/api";

const SUPER_SECRET = process.env.AGENT_SECRET || "";

// Initialize Braintrust logging (same pattern as run-agent.ts)
if (process.env.BRAINTRUST_API_KEY) {
  initLogger({
    projectName: process.env.BRAINTRUST_PROJECT_NAME || "Threadway",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });
}

const { generateText } = wrapAISDK(ai);

const RouterDecisionSchema = z.object({
  action: z.union([z.literal("RUN"), z.literal("SKIP")]),
  workflowId: z.string().optional(),
  confidence: z.number().min(0).max(1),
  reason: z.string().optional().default("")
});
export type RouterDecision = z.infer<typeof RouterDecisionSchema>;

type RouteParams = {
  userId: Id<"users">;
  userInput: string;
  context: ModelMessage[]; // last 4 messages
};

export async function routeWorkflow(params: RouteParams): Promise<Result<{
  decision: RouterDecision;
  workflowsConsidered: number;
  selected?: WorkflowWithIntegrations;
}, Error>> {
  try {
    const [workflows, connectedToolkits] = await Promise.all([
      listUserWorkflowsWithIntegrations(params.userId),
      convexClient.query(api.agent.queries.getUserConnectedToolkits, {
        userId: params.userId,
        secret: SUPER_SECRET,
      }) as Promise<string[]>,
    ]);

    const toolkitSet = new Set(connectedToolkits);
    const capped = workflows.slice(0, 10);

    const wfSummaries = capped.map((w) => ({
      id: String(w._id),
      title: w.title,
      content: truncate(w.content, 2000),
      requires: w.toolkitSlugs,
      hasAllConnections: w.toolkitSlugs.every((s) => toolkitSet.has(s))
    }));

    const contextCompact = params.context.map((m) => ({ role: m.role, content: compactContent(m.content) }));

    const system = `You are a workflow router. Decide whether to RUN one workflow based on the user's message and recent context. 
Output STRICT JSON with keys: action (RUN|SKIP), workflowId (when RUN), confidence (0..1), reason.`;

    const user = {
      message: params.userInput,
      context: contextCompact,
      workflows: wfSummaries,
    };

    const result = await generateText({
      model: ai.gateway("anthropic/claude-sonnet-4.5"),
      system,
      prompt: JSON.stringify(user),
      stopWhen: stepCountIs(3),
    });

    const parsed = safeParseJson(result.text ?? "{}");
    const validated = RouterDecisionSchema.safeParse(parsed);
    if (!validated.success) {
      return ok({ decision: { action: "SKIP", confidence: 0, reason: "invalid-json" }, workflowsConsidered: wfSummaries.length });
    }

    const decision = validated.data;
    // confidence threshold and connection availability
    if (decision.action === "RUN" && decision.workflowId) {
      const selected = capped.find((w) => String(w._id) === decision.workflowId);
      if (!selected) {
        return ok({ decision: { action: "SKIP", confidence: 0, reason: "unknown-workflow" }, workflowsConsidered: wfSummaries.length });
      }
      const hasAll = selected.toolkitSlugs.every((s) => toolkitSet.has(s));
      if (decision.confidence >= 0.55 && hasAll) {
        return ok({ decision, workflowsConsidered: wfSummaries.length, selected });
      }
      return ok({ decision: { action: "SKIP", confidence: decision.confidence, reason: hasAll ? "low-confidence" : "missing-connections" }, workflowsConsidered: wfSummaries.length });
    }

    return ok({ decision: { action: "SKIP", confidence: decision.confidence, reason: decision.reason || "no-selection" }, workflowsConsidered: wfSummaries.length });
  } catch (e: any) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) : s;
}

function compactContent(c: any): any {
  if (typeof c === "string") return truncate(c, 500);
  if (Array.isArray(c)) {
    return c.map((p) => {
      if (p && typeof p === "object" && p.type === "text" && typeof p.text === "string") {
        return { type: "text", text: truncate(p.text, 300) };
      }
      return p;
    });
  }
  return c;
}

function safeParseJson(s: string) {
  try {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(s.slice(start, end + 1));
    }
    return JSON.parse(s);
  } catch {
    return {};
  }
}


