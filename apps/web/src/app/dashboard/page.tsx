import { redirect } from "next/navigation"

import { getToken } from "@convex-dev/better-auth/nextjs"
import { createAuth } from "@whatsapp-mcp-client/backend/lib/auth"
import { fetchQuery } from "convex/nextjs"
import { api } from "@whatsapp-mcp-client/backend/convex/api"

export default async function Dashboard() {

  const token = await getToken(createAuth)
  const session = await fetchQuery(api.auth.getCurrentUser, {}, { token })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      WIP
    </div>
  )
}

