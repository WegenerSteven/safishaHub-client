import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Car, DollarSign, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import type { Booking } from '@/interfaces'
import { bookingsService } from '@/services'

export const Route = createFileRoute('/dashboard/bookings')({
  component: BookingsPage,
})

function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to load user bookings from API
      const userBookings = await bookingsService.getMyBookings()
      setBookings(userBookings)
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setError('Failed to load bookings. Please try again later.')
      // Fallback to mock data for development
      setBookings(getMockBookings())
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const reason = prompt('Please provide a reason for cancellation (optional):')
      await bookingsService.cancelBooking(bookingId, reason || undefined)
      loadBookings() // Reload bookings
    } catch (err) {
      console.error('Failed to cancel booking:', err)
      alert('Failed to cancel booking. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600">
            <p>{error}</p>
            <Button 
              onClick={loadBookings}
              className="mt-2 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Book Your First Service
            </Button>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Car className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.service.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                      </span>
                    </div>

                    {booking.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.location.address}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(booking.totalAmount)}</span>
                    </div>
                  </div>

                  {booking.serviceProvider && (
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Provider:</strong> {booking.serviceProvider.businessName}
                      {booking.serviceProvider.phone && (
                        <span className="ml-2">• {booking.serviceProvider.phone}</span>
                      )}
                    </div>
                  )}

                  {booking.specialInstructions && (
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Special Instructions:</strong> {booking.specialInstructions}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {booking.status === 'pending' && (
                    <Button
                      onClick={() => handleCancelBooking(booking.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Mock data function for fallback
function getMockBookings(): Booking[] {
  return [
    {
      id: '1',
      customerId: 'customer-1',
      serviceId: 'service-1',
      serviceProviderId: 'provider-1',
      scheduledDate: '2024-12-07',
      scheduledTime: '10:00',
      status: 'confirmed',
      totalAmount: 35,
      paymentStatus: 'paid',
      specialInstructions: 'Please use eco-friendly products',
      vehicleType: 'sedan',
      location: {
        address: 'Downtown Service Center',
        note: 'Near the main entrance'
      },
      service: {
        id: 'service-1',
        name: 'Premium Wash',
        type: 'premium',
        estimatedDuration: 45
      },
      serviceProvider: {
        id: 'provider-1',
        businessName: 'John Doe Car Wash',
        phone: '+1 (555) 123-4567',
        rating: 4.8
      },
      customer: {
        id: 'customer-1',
        name: 'John Customer',
        phone: '+1 (555) 987-6543',
        email: 'john@example.com'
      },
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z'
    },
    {
      id: '2',
      customerId: 'customer-1',
      serviceId: 'service-2',
      serviceProviderId: 'provider-2',
      scheduledDate: '2024-12-05',
      scheduledTime: '14:00',
      status: 'completed',
      totalAmount: 15,
      paymentStatus: 'paid',
      vehicleType: 'suv',
      location: {
        address: 'Westside Station'
      },
      service: {
        id: 'service-2',
        name: 'Basic Wash',
        type: 'basic',
        estimatedDuration: 20
      },
      serviceProvider: {
        id: 'provider-2',
        businessName: 'Quick Wash Pro',
        phone: '+1 (555) 234-5678',
        rating: 4.5
      },
      customer: {
        id: 'customer-1',
        name: 'John Customer',
        phone: '+1 (555) 987-6543',
        email: 'john@example.com'
      },
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2024-12-05T00:00:00Z'
    },
    {
      id: '3',
      customerId: 'customer-1',
      serviceId: 'service-3',
      serviceProviderId: 'provider-3',
      scheduledDate: '2024-12-10',
      scheduledTime: '09:00',
      status: 'pending',
      totalAmount: 65,
      paymentStatus: 'pending',
      vehicleType: 'sedan',
      location: {
        address: 'Elite Car Care Center'
      },
      service: {
        id: 'service-3',
        name: 'Deluxe Detailing',
        type: 'deluxe',
        estimatedDuration: 90
      },
      serviceProvider: {
        id: 'provider-3',
        businessName: 'Elite Car Care',
        phone: '+1 (555) 345-6789',
        rating: 4.9
      },
      customer: {
        id: 'customer-1',
        name: 'John Customer',
        phone: '+1 (555) 987-6543',
        email: 'john@example.com'
      },
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z'
    }
  ]
}
