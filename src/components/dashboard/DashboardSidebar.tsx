import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Calendar,
  Car,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Settings,
  UserIcon,
  ServerIcon,
  X,
} from 'lucide-react'
import type { User } from '@/services/auth.service';
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'

interface DashboardSidebarProps {
  children: React.ReactNode
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  // Navigation items based on user role
  const customerNavItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'My Bookings',
      href: '/dashboard/bookings',
      icon: Calendar,
      current: location.pathname === '/dashboard/bookings',
    },
    {
      name: 'Payments',
      href: '/dashboard/payments',
      icon: CreditCard,
      current: location.pathname === '/dashboard/payments',
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      current: location.pathname === '/dashboard/profile',
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      current: location.pathname === '/dashboard/settings',
    },
  ]

  const providerNavItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Bookings',
      href: '/dashboard/provider-bookings',
      icon: Calendar,
      current: location.pathname === '/dashboard/provider-bookings',
    },
    {
      name: 'Register Business',
      href: '/dashboard/business/register',
      icon: Car,
      current: location.pathname === '/dashboard/business/register',
    },
    {
      name: 'Services',
      href: '/dashboard/services/manage',
      icon: ServerIcon,
      current: location.pathname === '/dashboard/business/manage',
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      current: location.pathname === '/dashboard/profile',
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      current: location.pathname === '/dashboard/settings',
    },
  ]

  const navigation =
    user.role === 'service_provider' ? providerNavItems : customerNavItems

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed top-0 left-0 w-64 h-full bg-card shadow-xl border-r">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-foreground">
                SafishaHub
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.current
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full border-red-600 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-50">
        <div className="flex flex-col flex-grow bg-card shadow-lg border-r border-border">
          <div className="flex items-center justify-center p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-foreground">
                SafishaHub
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.current
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full border-red-600 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top bar for mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">
                SafishaHub
              </span>
            </div>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
