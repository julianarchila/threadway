'use client'

import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function WorkflowsSidebarSkeleton() {
  return (
    <SidebarMenu>
      {Array.from({ length: 3 }).map((_, i) => (
        <SidebarMenuItem key={i}>
          <div className="flex items-center w-full px-2 py-1.5">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-6 ml-2" />
          </div>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

