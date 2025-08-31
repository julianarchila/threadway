import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/f/$workflowId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/f/$workflowId"!</div>
}
