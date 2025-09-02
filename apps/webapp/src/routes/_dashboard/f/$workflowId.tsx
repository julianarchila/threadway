import { WorkflowEditor } from '@/components/workflows/workflow-editor';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute} from '@tanstack/react-router'
import { api } from '@threadway/backend/convex/api';
import { Id } from '@threadway/backend/convex/dataModel';

export const Route = createFileRoute('/_dashboard/f/$workflowId')({
  component: RouteComponent,
  loader: async ({context, params}) => {
    const { workflowId } = params;
    await context.queryClient.prefetchQuery(convexQuery(api.workflows.queries.getWorkflowById, { workflowId: workflowId as Id<"workflows"> }));
  }
})

function RouteComponent() {
  const { workflowId } = Route.useParams();
  return <WorkflowEditor workflowId={workflowId as Id<"workflows">} />;
}
