import { createFileRoute } from '@tanstack/react-router'
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  return <CustomerDashboard />
}
