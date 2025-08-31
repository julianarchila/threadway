import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";

export const Route = createFileRoute('/_dashboard')({
    component: RouteComponent,
    beforeLoad: async ({context}) => {
        if (!context.userId) {
            throw redirect({ to: "/login" })
        }
    }
})

function RouteComponent() {
    return <Authenticated>
        <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
            <div className="flex items-center p-4 border-b">
                <SidebarTrigger />
            </div>
            <div className="flex-1 p-4 relative">
                <Outlet />

            </div>
        </main>
    </SidebarProvider>
    </Authenticated>
}
