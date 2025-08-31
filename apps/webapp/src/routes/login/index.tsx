import GoogleAuthForm from '@/components/auth/google-auth-form'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  beforeLoad: async ({context}) => {
    if (context.userId) {
      throw redirect({ to: "/" }) 
    }
  }
})

function RouteComponent() {
  return <GoogleAuthForm />
}
