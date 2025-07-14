import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, Calendar, Clock, User, AlertCircle } from 'lucide-react'
import { bookingsService } from '@/services'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { BookingStatus } from '@/interfaces'

export const Route = createFileRoute('/dashboard/provider-bookings')({
  component: ProviderBookingsPage,
})

function ProviderBookingsPage() {
  const { user, isAuthenticated, isServiceProvider } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (isAuthenticated && isServiceProvider) {
      loadProviderBookings()
    }
  }, [isAuthenticated, isServiceProvider])
  
  const loadProviderBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const providerBookings = await bookingsService.getProviderBookings()
      setBookings(providerBookings)
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setError('Failed to load provider bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await bookingsService.updateBooking(bookingId, { status: newStatus })
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus } 
          : booking
      ))
    } catch (err) {
      console.error('Failed to update booking status:', err)
      alert('Failed to update booking status. Please try again.')
    }
  }
  
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (e) {
      return dateStr
    }
  }
  
  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':')
      const h = parseInt(hours)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const hour12 = h % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    } catch (e) {
      return timeStr
    }
  }
  
  const getStatusBadge = (status: string) => {
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
  
  if (!isAuthenticated || !isServiceProvider) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">Access Restricted</h1>
        <p>This page is only available to service providers.</p>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading your bookings...</p>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Service Bookings</h1>
        <Button onClick={loadProviderBookings}>Refresh</Button>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-medium mb-2">No bookings found</h2>
          <p className="text-gray-600 mb-4">
            You don't have any bookings yet. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Booking #{booking.booking_number || booking.id.substring(0, 8)}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  <p>{booking.service?.name || 'Service'}</p>
                  <p className="font-medium">${parseFloat(booking.total_amount || '0').toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{formatDate(booking.service_date)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{formatTime(booking.service_time)}</span>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div className="border-t pt-3 mb-3">
                  <h4 className="font-medium flex items-center mb-1">
                    <User className="h-4 w-4 mr-1" />
                    Customer
                  </h4>
                  
                  <div className="text-sm text-gray-600">
                    {booking.user ? (
                      <>
                        <p>{booking.user.first_name} {booking.user.last_name}</p>
                        <p>{booking.user.email}</p>
                        <p>{booking.user.phone}</p>
                      </>
                    ) : (
                      <p>Customer information not available</p>
                    )}
                  </div>
                </div>
                
                {/* Vehicle Info */}
                {booking.vehicle_info && (
                  <div className="text-sm">
                    <h4 className="font-medium mb-1">Vehicle</h4>
                    <div className="text-gray-600">
                      {booking.vehicle_info.type} {booking.vehicle_info.make} {booking.vehicle_info.model}
                      {booking.vehicle_info.license_plate && (
                        <span className="block">Plate: {booking.vehicle_info.license_plate}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="p-4 border-t bg-gray-50">
                {booking.status === BookingStatus.PENDING && (
                  <div className="flex space-x-2">
                    <Button 
                      className="w-full bg-blue-600"
                      onClick={() => handleUpdateStatus(booking.id, BookingStatus.CONFIRMED)}
                    >
                      Confirm
                    </Button>
                    <Button 
                      className="w-full"
                      variant="destructive"
                      onClick={() => handleUpdateStatus(booking.id, BookingStatus.CANCELLED)}
                    >
                      Decline
                    </Button>
                  </div>
                )}
                
                {booking.status === BookingStatus.CONFIRMED && (
                  <Button 
                    className="w-full bg-green-600"
                    onClick={() => handleUpdateStatus(booking.id, BookingStatus.COMPLETED)}
                  >
                    Mark Complete
                  </Button>
                )}
                
                {booking.status === BookingStatus.IN_PROGRESS && (
                  <Button 
                    className="w-full bg-green-600"
                    onClick={() => handleUpdateStatus(booking.id, BookingStatus.COMPLETED)}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
