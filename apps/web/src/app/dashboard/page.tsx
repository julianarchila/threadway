import { redirect } from "next/navigation"

import { IntegrationsSection } from "@/components/integrations-section"
import { mockIntegrations } from "./integrations.data"
import { ModeToggle } from "@/components/mode-toggle"
import { SignOutButton } from "@/components/sign-out-button"
import { getToken } from "@convex-dev/better-auth/nextjs"
import { createAuth } from "@whatsapp-mcp-client/backend/lib/auth"
import { fetchQuery } from "convex/nextjs"
import { api } from "@whatsapp-mcp-client/backend/convex/api"

export default async function Dashboard() {

  const token = await getToken(createAuth)
  const session = await fetchQuery(api.auth.getCurrentUser, {}, {token})

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader session={session} />
      <IntegrationsSection initialIntegrations={mockIntegrations} />
    </div>
  )
}

function DashboardHeader({ session }: { session: any }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-brand-gradient text-white shadow-sm">
              <span className="text-sm font-bold">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight">Threadway</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <span className="text-sm text-muted-foreground">Welcome, </span>
              <span className="text-sm font-medium">{session.name}</span>
            </div>
            <ModeToggle />
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
