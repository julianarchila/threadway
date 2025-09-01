import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      Home
    </div>
  )
}
