'use client'

import { Blocks, Home, FileText, Loader2, Plus, MoreHorizontal, Trash2 } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useRouter } from "@tanstack/react-router"
import { useQuery, useMutation } from "convex/react"
import { api } from "@whatsapp-mcp-client/backend/convex/api"
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel";


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
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
import UserMenu from "./auth/user-menu"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Blocks,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const workflows = useQuery(api.workflows.queries.getUserWorkflows)
  const createWorkflowMutation = useMutation(api.workflows.mutations.create)
  const deleteWorkflowMutation = useMutation(api.workflows.mutations.deleteWorkflow)

  const handleCreateWorkflow = async () => {
    const workflowId = await createWorkflowMutation()
    router.navigate({ to: `/dashboard/f/${workflowId}` })
  }
  const handleDeleteWorkflow = async (workflowId: Id<"workflows">) => {
    await deleteWorkflowMutation({ id: workflowId })
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
            <SidebarMenu>
              {workflows === undefined ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading workflows...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : workflows.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FileText className="h-4 w-4" />
                    <span>No workflows yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                workflows.map((workflow) => (
                  <SidebarMenuItem key={workflow._id}>
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
                            onClick={() => handleDeleteWorkflow(workflow._id)}
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}