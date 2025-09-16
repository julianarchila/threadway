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
import { MessageSquare, X } from 'lucide-react';

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
  const isWorkflowRoute = false;

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
        <SidebarInset className="transition-all duration-300 ease-in-out">
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger />
          </div>
          <div className="flex-1 p-4 relative">
            <Outlet />
          </div>
        </SidebarInset>

        {/* Chat UI moved into workflow route. Floating button and sidebar removed. */}
      </SidebarProvider>

    </Authenticated>

  </>
}
