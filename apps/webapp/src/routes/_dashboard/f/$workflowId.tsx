import { WorkflowEditor } from '@/components/workflows/workflow-editor';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute} from '@tanstack/react-router'
import { api } from '@whatsapp-mcp-client/backend/convex/api';
import { Id } from '@whatsapp-mcp-client/backend/convex/dataModel';

export const Route = createFileRoute('/_dashboard/f/$workflowId')({
  component: RouteComponent,
  loader: async ({context, params}) => {
    const { workflowId } = params;
    context.queryClient.prefetchQuery(convexQuery(api.workflows.queries.getWorkflowById, { workflowId: workflowId as Id<"workflows"> }));
  }
})

function RouteComponent() {
  const { workflowId } = Route.useParams();
  return <WorkflowEditor workflowId={workflowId as Id<"workflows">} />;
}
