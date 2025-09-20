import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { createFileRoute, Outlet, redirect, useRouter, useRouterState } from '@tanstack/react-router'
import { AppSidebar } from '@/components/sidebar/app-sidebar'

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";
import { useEffect, useState } from 'react';
import Loader from '@/components/loader';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@threadway/backend/convex/api';
import { MessageSquare } from 'lucide-react';
 

export const Route = createFileRoute('/_dashboard')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/login" })
    }
  },
  loader: async ({ context }) => {
    context.queryClient.prefetchQuery(convexQuery(api.workflows.queries.getUserWorkflows, {}))

  }
})

function RouteComponent() {
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const { location } = useRouterState();
  const isWorkflowRoute = location.pathname.startsWith('/f/');

  useEffect(() => {
    function handleOpen() {
      setShowChatSidebar(true);
    }
    function handleClose() {
      setShowChatSidebar(false);
    }
    window.addEventListener('open-chat', handleOpen as EventListener);
    window.addEventListener('close-chat', handleClose as EventListener);
    return () => {
      window.removeEventListener('open-chat', handleOpen as EventListener);
      window.removeEventListener('close-chat', handleClose as EventListener);
    };
  }, []);

  function UnauthRedirect() {
    const router = useRouter();
    useEffect(() => {
      const next = window.location.pathname + window.location.search + window.location.hash;
      router.navigate({ to: `/login?next=${encodeURIComponent(next)}` });
    }, [router]);
    return null;
  }

  return <>
    <AuthLoading><Loader /></AuthLoading>
    <Unauthenticated><UnauthRedirect /></Unauthenticated>
    <Authenticated>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset 
          className="transition-all duration-300 ease-in-out"
          style={{
            width: showChatSidebar && isWorkflowRoute ? 'calc(100% - 384px)' : '100%',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: showChatSidebar && isWorkflowRoute ? 'calc(100% - 384px)' : '100%',
            overflowX: 'hidden'
          }}
        >
          <div className="flex items-center p-4 border-b justify-between">
            <SidebarTrigger />
            {isWorkflowRoute && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-chat'))
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Open chat"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex-1 p-4 relative">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

    </Authenticated>

  </>
}
