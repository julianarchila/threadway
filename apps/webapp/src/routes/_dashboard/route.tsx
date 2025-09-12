import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarInset } from '@/components/ui/sidebar'
import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router'
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
            width: showChatSidebar ? 'calc(100% - 250px)' : '100%',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: showChatSidebar ? 'calc(100% - 250px)' : '100%'
          }}
        >
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger />
          </div>
          <div className="flex-1 p-4 relative">
            <Outlet />
          </div>
        </SidebarInset>

        {/* Botón flotante para abrir chat - fuera del SidebarInset */}
        {!showChatSidebar && (
          <button
            onClick={() => setShowChatSidebar(true)}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        )}

        {/* Chat sidebar usando Sidebar de shadcn/ui */}
        {showChatSidebar && (
          <Sidebar 
            side="right" 
            className="w-80"
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
            <SidebarHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <button
                  onClick={() => setShowChatSidebar(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-0">
              <div className="flex-1 min-h-0">
                <Chatbot />
              </div>
            </SidebarContent>
          </Sidebar>
        )}
      </SidebarProvider>

    </Authenticated>

  </>
}
