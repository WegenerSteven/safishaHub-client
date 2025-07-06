import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('auth_token')
      if (!isAuthenticated) {
        throw redirect({ to: '/login' })
      }
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar>
        <Outlet />
      </DashboardSidebar>
    </div>
  )
}
