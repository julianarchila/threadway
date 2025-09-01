import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
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
import { api } from '@whatsapp-mcp-client/backend/convex/api';
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
        <main className="flex-1 flex flex-col min-h-screen">
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger />
          </div>
          <div className="flex-1 p-4 relative">
            <Outlet />


            {/* Botón flotante para abrir chat */}
            {!showChatSidebar && (
              <button
                onClick={() => setShowChatSidebar(true)}
                className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            )}

          </div>
        </main>
      </SidebarProvider>

      {/* Chat sidebar independiente */}
      {showChatSidebar && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 border-l bg-background shadow-lg">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <button
                onClick={() => setShowChatSidebar(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <Chatbot />
            </div>
          </div>
        </div>
      )}

    </Authenticated>

  </>
}
