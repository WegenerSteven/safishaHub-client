import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Car, Clock, DollarSign, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/dashboard/bookings')({
  component: BookingsPage,
})

function BookingsPage() {
  // Mock booking data
  const bookings = [
    {
      id: '1',
      service: 'Premium Wash',
      date: '2024-12-07',
      time: '10:00 AM',
      location: 'Downtown Service Center',
      price: 35,
      status: 'confirmed',
      provider: 'John Doe Car Wash',
    },
    {
      id: '2',
      service: 'Basic Wash',
      date: '2024-12-05',
      time: '2:00 PM',
      location: 'Westside Station',
      price: 15,
      status: 'completed',
      provider: 'Quick Wash Pro',
    },
    {
      id: '3',
      service: 'Deluxe Detailing',
      date: '2024-12-10',
      time: '9:00 AM',
      location: 'Elite Car Care',
      price: 65,
      status: 'pending',
      provider: 'Elite Car Care',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage your car wash appointments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Car className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.service}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {booking.date} at {booking.time}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>${booking.price}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Provider: {booking.provider}
                </p>
              </div>

              <div className="flex space-x-2 ml-4">
                {booking.status === 'confirmed' && (
                  <>
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                )}
                {booking.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600 mb-4">
            Book your first car wash service to get started
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">Book Now</Button>
        </div>
      )}
    </div>
  )
}
