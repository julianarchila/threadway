'use client'

import { FileText } from "lucide-react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@whatsapp-mcp-client/backend/convex/api"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { WorkflowSidebarItem } from "./workflow-sidebar-item"

export function WorkflowsSidebarContent() {
  const { data: workflows } = useSuspenseQuery(
    convexQuery(api.workflows.queries.getUserWorkflows, {})
  )

  if (workflows.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <FileText className="h-4 w-4" />
            <span>No workflows yet</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      {workflows.map((workflow) => (
        <WorkflowSidebarItem key={workflow._id} workflow={workflow} />
      ))}
    </SidebarMenu>
  )
}

