
// External imports
import { redirect } from "next/navigation";
import { getToken } from "@convex-dev/better-auth/nextjs"
import { fetchQuery } from "convex/nextjs"

// Monorepo packages imports
import { createAuth } from "@whatsapp-mcp-client/backend/lib/auth"
import { api } from "@whatsapp-mcp-client/backend/convex/api"

// Local imports
import PhoneAuthForm from "@/components/phone-auth-form";

export default async function LoginPage() {

  const token = await getToken(createAuth)
  const session = await fetchQuery(api.auth.getCurrentUser, {}, { token })

  if (session) {
    redirect("/dashboard")
  }
  return <PhoneAuthForm />;
}
