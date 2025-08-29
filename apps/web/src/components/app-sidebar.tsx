'use client'

import { Calendar, Home, Inbox, Search, Settings, FileText, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@whatsapp-mcp-client/backend/convex/api"

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
import UserMenu from "./auth/user-menu"

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const workflows = useQuery(api.workflows.queries.getUserWorkflows)
  const createWorkflowMutation = useMutation(api.workflows.mutations.create)

  const handleCreateWorkflow = async () => {
    const workflowId = await createWorkflowMutation()
    router.push(`/dashboard/f/${workflowId}`)
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
                    <SidebarMenuButton asChild>
                      <Link href={`/dashboard/f/${workflow._id}`}>
                        <FileText className="h-4 w-4" />
                        <span>{workflow.title || 'Untitled Workflow'}</span>
                      </Link>
                    </SidebarMenuButton>
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
