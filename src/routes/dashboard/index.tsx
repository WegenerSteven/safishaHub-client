import { createFileRoute } from '@tanstack/react-router'
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard'
import { ServiceProviderDashboard } from '@/components/dashboard/ServiceProviderDashboard'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            Please log in to access your dashboard.
          </p>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  return user.role === 'service_provider' ? <ServiceProviderDashboard /> : <CustomerDashboard />
}
