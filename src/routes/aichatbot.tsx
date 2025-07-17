import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/aichatbot')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/aichatbot"!</div>
}
