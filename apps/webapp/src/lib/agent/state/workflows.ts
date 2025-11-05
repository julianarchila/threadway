import { convexClient } from "@/lib/convex";
import { api } from "@threadway/backend/convex/api";
import type { Id } from "@threadway/backend/convex/dataModel";

const SUPER_SECRET = process.env.AGENT_SECRET || "";

export type WorkflowWithIntegrations = {
  _id: Id<"workflows">;
  title: string;
  content: string;
  updatedAt: number;
  toolkitSlugs: string[];
}

export async function listUserWorkflowsWithIntegrations(userId: Id<"users">) {
  return convexClient.query(api.agent.queries.listUserWorkflowsWithIntegrations, {
    userId,
    secret: SUPER_SECRET,
  }) as Promise<WorkflowWithIntegrations[]>;
}


