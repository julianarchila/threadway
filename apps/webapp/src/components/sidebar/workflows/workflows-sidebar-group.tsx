'use client'

import { Plus } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import { api } from "@whatsapp-mcp-client/backend/convex/api"
import { Suspense } from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { WorkflowsSidebarContent } from "./workflows-sidebar-content"
import { WorkflowsSidebarSkeleton } from "./workflows-sidebar-skeleton"

export function WorkflowsSidebarGroup() {
  const router = useRouter()
  const createWorkflowMutation = useMutation(api.workflows.mutations.create)

  const handleCreateWorkflow = async () => {
    const workflowId = await createWorkflowMutation()
    router.navigate({ to: "/f/$workflowId", params: { workflowId } })
  }

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between px-2 py-1">
        <SidebarGroupLabel>Workflows</SidebarGroupLabel>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateWorkflow}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <SidebarGroupContent>
        <Suspense fallback={<WorkflowsSidebarSkeleton />}>
          <WorkflowsSidebarContent />
        </Suspense>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

