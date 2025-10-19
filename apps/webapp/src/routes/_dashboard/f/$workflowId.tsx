import { WorkflowEditor } from '@/components/workflows/workflow-editor';
 
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute} from '@tanstack/react-router'
import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { api } from '@threadway/backend/convex/api';
import { Id } from '@threadway/backend/convex/dataModel';

export const Route = createFileRoute('/_dashboard/f/$workflowId')({
  component: RouteComponent,
  loader: async ({context, params}) => {
    const { workflowId } = params;
    await context.queryClient.prefetchQuery(convexQuery(api.workflows.queries.getWorkflowById, { workflowId: workflowId as Id<"workflows"> }));
  },
  errorComponent: () => {
    const router = useRouter()
    useEffect(() => {
      router.navigate({ to: '/' })
    }, [router])
    return null
  },
})

function RouteComponent() {
  const { workflowId } = Route.useParams();
  return (
    <div className="flex gap-4 w-full overflow-x-hidden max-w-[100vw]">
      <div className="flex-1 min-w-0">
        <WorkflowEditor workflowId={workflowId as Id<"workflows">} />
      </div>

      {/* Chat UI moved to dashboard right sidebar */}
    </div>
  );
}
