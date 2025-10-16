import { createServerFileRoute } from '@tanstack/react-start/server'
import { serve } from "inngest/edge"
import { inngest, functions } from "@/lib/ingest"


const handler = serve({ client: inngest, functions });

export const ServerRoute = createServerFileRoute('/api/inngest').methods({
  GET: async ({ request }) => handler(request),
  POST: async ({ request }) => handler(request),
  PUT: async ({ request }) => handler(request)
})

