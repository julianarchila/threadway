import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'
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
import Chatbot from '@/components/chatbot';

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
                onClick={() => setShowChatSidebar(true)}
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

        {/* Right chat sidebar */}
        {isWorkflowRoute && showChatSidebar && (
          <Sidebar 
            side="right" 
            className="w-96 min-w-[320px] max-w-[400px]"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              zIndex: 50,
              backgroundColor: 'hsl(var(--background))',
              borderLeft: '1px solid hsl(var(--border))',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
            }}
          >
            <SidebarHeader className="p-3 border-b bg-background/95 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold truncate">AI Assistant</h2>
                <button
                  onClick={() => setShowChatSidebar(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-0 flex flex-col h-full">
              <div className="flex-1 min-h-0 overflow-hidden">
                <Chatbot />
              </div>
            </SidebarContent>
          </Sidebar>
        )}
      </SidebarProvider>

    </Authenticated>

  </>
}
