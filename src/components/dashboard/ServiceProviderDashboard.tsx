import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Settings, BarChart3 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function ServiceProviderDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Provider Dashboard</h1>
          <p className="text-gray-600">Manage your car wash business</p>
        </div>
        <Link to="/dashboard/register-business">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Register Business
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh 0</div>
            <p className="text-xs text-muted-foreground">Start earning today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Pending</div>
            <p className="text-xs text-muted-foreground">Complete registration</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Registration Prompt */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Get Started with Your Business</CardTitle>
          <CardDescription className="text-blue-700">
            Complete your business registration to start accepting bookings and earning money.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard/register-business" className="flex-1">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Bookings</CardTitle>
            <CardDescription>View and manage your customer bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              No bookings to display. Complete your business registration to start receiving bookings.
            </p>
            <Button variant="outline" disabled>
              View Bookings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Update your business information and services</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Set up your business profile to attract more customers.
            </p>
            <Link to="/dashboard/register-business">
              <Button variant="outline">
                Update Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
