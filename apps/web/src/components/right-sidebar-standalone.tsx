"use client"

import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export function RightSidebarStandalone() {
  return (
    <SidebarProvider>
      <Sidebar side="right">
        <SidebarContent />
      </Sidebar>
      <SidebarTrigger className="fixed right-4 top-4 z-50" />
    </SidebarProvider>
  )
} 