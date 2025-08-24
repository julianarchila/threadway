import { redirect } from "next/navigation"

import { getToken } from "@convex-dev/better-auth/nextjs"
import { createAuth } from "@whatsapp-mcp-client/backend/lib/auth"
import { fetchQuery } from "convex/nextjs"
import { api } from "@whatsapp-mcp-client/backend/convex/api"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function DasshboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;

}>) {

  const token = await getToken(createAuth)
  const session = await fetchQuery(api.auth.getCurrentUser, {}, { token })

  if (!session) {
    redirect("/login")
  }
  return (
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
  )
}
