// External imports
import { preloadQuery } from "convex/nextjs";
import { getToken } from "@convex-dev/better-auth/nextjs";

// Monorepo packages imports
import { api } from "@whatsapp-mcp-client/backend/convex/api";
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel";
import { createAuth } from "@whatsapp-mcp-client/backend/lib/auth";

// Local imports
import { WorkflowEditor } from "@/components/workflows/workflow-editor";

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  const workflowIdTyped = workflowId as Id<"workflows">;
  
  // Get the auth token for server-side preloading
  const token = await getToken(createAuth);
  
  // Preload the workflow data on the server
  const preloadedWorkflow = await preloadQuery(
    api.workflows.queries.getWorkflowById,
    { workflowId: workflowIdTyped },
    { token }
  );

  return <WorkflowEditor preloadedWorkflow={preloadedWorkflow} workflowId={workflowIdTyped} />;
}
