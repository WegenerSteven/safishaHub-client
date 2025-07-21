import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Settings, BarChart3, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { serviceProviderDashboardService } from '@/services'
import { BookingStatus } from '@/interfaces'
import { useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { ServiceProviderDashboardStats, ExtendedBooking } from '@/services/service-provider-dashboard.service'

export function ServiceProviderDashboard() {
  const [stats, setStats] = useState<ServiceProviderDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessStatus, setBusinessStatus] = useState<string>('pending')
  const { user, isServiceProvider } = useAuth()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)

        // Fetch dashboard statistics from backend
        const dashboardStats = await serviceProviderDashboardService.getDashboardStats()
        setStats(dashboardStats)

        // Set business status from API response
        setBusinessStatus(dashboardStats.businessStatus || 'inactive')
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error("Error loading dashboard", {
          description: "Could not load your dashboard data. Please try again."
        })
      } finally {
        setLoading(false)
      }
    }

    if (isServiceProvider) {
      loadDashboardData()
    }
  }, [isServiceProvider, user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getBusinessStatusDisplay = () => {
    switch (businessStatus) {
      case 'active':
        return { text: 'Active', color: 'text-emerald-600 dark:text-emerald-400', message: 'Your business is live' }
      case 'pending':
        return { text: 'Pending', color: 'text-amber-600 dark:text-amber-400', message: 'Complete registration' }
      default:
        return { text: 'Inactive', color: 'text-rose-600 dark:text-rose-400', message: 'Register your business' }
    }
  }

  const statusInfo = getBusinessStatusDisplay()

  // Access stats from the API or provide defaults
  const totalBookings = stats?.totalBookings || 0
  const totalRevenue = stats?.totalEarnings || 0
  const pendingBookings = stats?.pendingBookings || 0
  const completedBookings = stats?.completedBookings || 0
  const recentBookings = stats?.recentBookings || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Provider Dashboard</h1>
          <p className="text-gray-600">Manage your car wash business</p>
        </div>
        {businessStatus !== 'active' && (
          <Link to="/dashboard/business/register">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Register Business
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  {totalBookings === 0 ? "No bookings yet" :
                    `${pendingBookings} pending, ${completedBookings} completed`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {totalBookings === 0 ? "Start earning today" :
                    `From ${completedBookings} completed bookings`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${statusInfo.color}`}>{statusInfo.text}</div>
                <p className="text-xs text-muted-foreground">{statusInfo.message}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {businessStatus !== 'active' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Get Started with Your Business</CardTitle>
            <CardDescription className="text-blue-700">
              Complete your business registration to start accepting bookings and earning money.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard/business/register" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Register Your Business
                </Button>
              </Link>
              <Button variant="outline" className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Bookings</CardTitle>
            <CardDescription>View and manage your customer bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">{pendingBookings} pending bookings</span>
                </div>
                <Link to="/dashboard/provider-bookings">
                  <Button variant={pendingBookings > 0 ? "default" : "outline"}
                    className={pendingBookings > 0 ? "bg-blue-600" : ""}>
                    View Bookings
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Update your business information and services</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {businessStatus === 'active'
                    ? "Keep your business information up to date to attract more customers."
                    : "Set up your business profile to attract more customers."}
                </p>
                <Link to="/dashboard/profile">
                  <Button variant="outline">
                    {businessStatus === 'active' ? 'Edit Profile' : 'Update Profile'}
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest bookings and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-28 w-full" />
            ) : recentBookings.length === 0 ? (
              <p className="text-sm text-gray-600">No recent activity to display.</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking: ExtendedBooking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-start space-x-3">
                      {booking.status === BookingStatus.PENDING ? (
                        <Clock className="h-4 w-4 text-amber-500 mt-1" />
                      ) : booking.status === BookingStatus.CONFIRMED ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                      ) : booking.status === BookingStatus.CANCELLED ? (
                        <XCircle className="h-4 w-4 text-red-500 mt-1" />
                      ) : (
                        <Calendar className="h-4 w-4 text-blue-500 mt-1" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {booking.user?.first_name || 'Customer'} booked {booking.service?.name || 'a service'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.service_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })} at {booking.service_time}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${booking.status === BookingStatus.PENDING
                      ? 'bg-amber-100 text-amber-800'
                      : booking.status === BookingStatus.CONFIRMED
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === BookingStatus.COMPLETED
                          ? 'bg-green-100 text-green-800'
                          : booking.status === BookingStatus.CANCELLED
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                ))}
                <Link to="/dashboard/provider-bookings" className="text-sm text-blue-600 hover:underline block pt-2">
                  View all bookings
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
