'use client'

import { FileText, MoreHorizontal, Trash2 } from "lucide-react"
import { Link, useLocation, useRouter } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import { api } from "@threadway/backend/convex/api"
import type { Id } from "@threadway/backend/convex/dataModel"

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WorkflowSidebarItemProps {
  workflow: {
    _id: Id<"workflows">
    title?: string
  }
}

export function WorkflowSidebarItem({ workflow }: WorkflowSidebarItemProps) {
  const deleteWorkflowMutation = useMutation(api.workflows.mutations.deleteWorkflow)
  const router = useRouter()
  const location = useLocation()

  const handleDeleteWorkflow = async () => {
    await deleteWorkflowMutation({ id: workflow._id })
    // If the current page is this workflow, redirect to home
    const isViewingThisWorkflow = location.pathname?.includes(`/f/${workflow._id}`)
    if (isViewingThisWorkflow) {
      router.navigate({ to: '/' })
    }
  }

  return (
    <SidebarMenuItem>
      <div className="flex items-center w-full">
        <SidebarMenuButton asChild className="flex-1">
          <Link to="/f/$workflowId" params={{
            workflowId: workflow._id,
          }}>
            <FileText className="h-4 w-4" />
            <span>{workflow.title || 'Untitled Workflow'}</span>
          </Link>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDeleteWorkflow}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarMenuItem>
  )
}

