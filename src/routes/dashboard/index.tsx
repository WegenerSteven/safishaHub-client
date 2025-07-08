import { createFileRoute } from '@tanstack/react-router'
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard'
import { ServiceProviderDashboard } from '@/components/dashboard/ServiceProviderDashboard'
import { authService } from '@/services/auth.service'
import { useEffect, useState } from 'react'
import type { User } from '@/interfaces/auth/User.interface'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            Please log in to access your dashboard.
          </p>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  if (user.role === 'service_provider') {
    return <ServiceProviderDashboard />
  }

  return <CustomerDashboard />
}
