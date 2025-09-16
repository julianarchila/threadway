import { WorkflowEditor } from '@/components/workflows/workflow-editor';
import Chatbot from '@/components/chatbot';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare } from 'lucide-react';
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
  return (
    <div className="flex gap-4 w-full">
      <div className="flex-1 min-w-0">
        <WorkflowEditor workflowId={workflowId as Id<"workflows">} />
      </div>

      {/* Desktop chat sidebar */}
      <div className="w-96 shrink-0 hidden xl:block">
        <div className="sticky top-4 h-[calc(100vh-2rem)] border-l pl-4">
          <Chatbot />
        </div>
      </div>

      {/* Mobile chat button + sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center xl:hidden"
            aria-label="Open chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-full sm:max-w-md">
          <SheetHeader className="p-3 border-b bg-background/95 backdrop-blur-sm">
            <SheetTitle>AI Assistant</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <Chatbot />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
