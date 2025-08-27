"use client";
import { redirect } from "next/navigation"

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { RightSidebarStandalone } from "@/components/right-sidebar-standalone"

export default function DasshboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;

}>) {

  return (
    <>
    <AuthLoading>
      <div>Loading...</div>
    </AuthLoading>
    <Unauthenticated>
      <div>Unauthenticated</div>
    </Unauthenticated>
    <Authenticated>
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex items-center p-4 border-b">
          <SidebarTrigger />
        </div>
        <div className="flex-1 p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
    <RightSidebarStandalone />

    </Authenticated>
    </>
  )
}
