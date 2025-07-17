import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  Calendar,
  Car,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Star,
  UserIcon,
  Users,
} from 'lucide-react'
import type {User} from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'

export function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center h-64 flex items-center justify-center">
        <div>
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

  const isProvider = user.role === 'service_provider'

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-blue-100">
          {isProvider
            ? 'Manage your car wash services and track your business performance.'
            : 'Book professional car wash services and manage your appointments.'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isProvider ? (
          <>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900"></p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Upcoming Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Services Used</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900"></p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-2xl font-bold text-gray-900">24h</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isProvider ? 'Recent Bookings' : 'Recent Activity'}
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {isProvider
                      ? 'Premium Wash - John Doe'
                      : 'Premium Wash Completed'}
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <span className="text-sm font-medium text-green-600">$35</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {isProvider ? (
              <>
                <Link to="/dashboard/bookings">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Services
                  </Button>
                </Link>
                <Link to="/dashboard/bookings">
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Bookings
                  </Button>
                </Link>
                <Link to="/dashboard/profile">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link to="/dashboard/profile">
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Customers
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard/bookings">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Service
                  </Button>
                </Link>
                <Link to="/dashboard/bookings">
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                  </Button>
                </Link>
                <Link to="/dashboard/profile">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </Link>
                <Link to="/dashboard/profile">
                  <Button variant="outline" className="w-full">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}