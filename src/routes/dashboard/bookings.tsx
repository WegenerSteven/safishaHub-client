import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Calendar, Car, DollarSign, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import type { Booking } from '@/interfaces'
import { toast } from 'sonner';
import { bookingsService } from '@/services'

export const Route = createFileRoute('/dashboard/bookings')({
  component: BookingsPage,
})

function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Attempting to load bookings from API...')

      // Try to load user bookings from API
      const userBookings = await bookingsService.getMyBookings()

      console.log('API response:', userBookings)

      // Ensure we have an array
      if (Array.isArray(userBookings)) {
        setBookings(userBookings)
        console.log('Successfully loaded', userBookings.length, 'bookings')
      } else {
        console.warn('API returned non-array data:', userBookings)
        setError('Invalid data format received from server.')
        setBookings([])
      }
    } catch (err: any) {
      console.error('Failed to load bookings:', err)

      // More specific error messaging
      let errorMessage = 'Failed to load bookings. '
      if (err?.response?.status === 404) {
        errorMessage += 'No bookings found.'
        setBookings([]) // Empty array for no bookings
      } else if (err?.response?.status === 401) {
        errorMessage += 'Please log in to view your bookings.'
        setBookings([])
      } else if (err?.code === 'NETWORK_ERROR' || err?.name === 'NetworkError') {
        errorMessage += 'Network error. Please check your connection.'
        setBookings([])
      } else {
        errorMessage += 'Please try again later.'
        setBookings([])
      }

      setError(errorMessage)
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
      if (reason === null) return // User cancelled the prompt

      setLoading(true)
      await bookingsService.cancelBooking(bookingId)

      // Show success message
      console.log('Booking cancelled successfully')

      // Reload bookings to get updated data
      await loadBookings()
    } catch (err: any) {
      console.error('Failed to cancel booking:', err)

      let errorMessage = 'Failed to cancel booking. '
      if (err?.response?.status === 404) {
        errorMessage += 'Booking not found.'
      } else if (err?.response?.status === 400) {
        errorMessage += 'Booking cannot be cancelled.'
      } else {
        errorMessage += 'Please try again.'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEditBooking = async (bookingId: string) => {
    try {
      const booking = await bookingsService.getBookingById(bookingId);
      setEditBooking(booking);
      setShowEdit(true);
      console.log('Edit booking details:', bookingId);
    } catch (error) {
      toast.error('Failed to load booking for editing');
    }
  }

  const handleEditSubmit = async (updatedData: { service_date: string; service_time: string; special_instructions: string }) => {
    try {
      if (!editBooking) {
        toast.error('No booking selected for editing');
        return;
      }
      await bookingsService.updateBooking(editBooking.id, updatedData);
      toast.success('Booking updated!');
      setShowEdit(false);
      loadBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  }

  const handleViewDetails = async (bookingId: string) => {
    try {
      const booking = await bookingsService.getBookingById(bookingId);
      setSelectedBooking(booking);
      setShowDetails(true);
      // Navigate to booking details page
      console.log('View booking details:', bookingId)

    } catch (error) {
      toast.error('Failed to load booking details');
    }

  }

  const handleCreateBooking = () => {
    // Navigate to services page to browse and book services
    console.log('Navigating to services page')
    navigate({ to: '/services' })
  }

  // Simple modal component
  type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  };

  const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          {children}
        </div>
      </div>
    );
  };

  // Edit form for booking
  type EditBookingFormProps = {
    booking: Booking;
    onSubmit: (updatedData: { service_date: string; service_time: string; license_plate: string; special_instructions: string }) => Promise<void>;
    onCancel: () => void;
  };

  const EditBookingForm: React.FC<EditBookingFormProps> = ({ booking, onSubmit, onCancel }) => {
    const [date, setDate] = useState(booking.service_date);
    const [time, setTime] = useState(booking.service_time);
    const [licensePlate, setLicensePlate] = useState(booking.vehicle_info?.license_plate || '');
    const [specialInstructions, setSpecialInstructions] = useState(booking.specialInstructions || booking.special_instructions || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      await onSubmit({
        service_date: date,
        service_time: time,
        license_plate: licensePlate,
        special_instructions: specialInstructions,
      });
      setLoading(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1 w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="border rounded px-2 py-1 w-full" required />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>License Plate</label>
          <input type='text' value={licensePlate} onChange={e => setLicensePlate(e.target.value)} className='border rounded px-2 py-1 ' placeholder='Enter License plate' required></input>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Special Instructions</label>
          <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} className="border rounded px-2 py-1 w-full" rows={3} />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    );
  };

  // Details modal content
  const BookingDetails: React.FC<{ booking: Booking }> = ({ booking }) => (
    <div className="space-y-2">
      <div><strong>Service:</strong> {booking.service?.name}</div>
      <div><strong>Date:</strong> {formatDate(booking.service_date)}</div>
      <div><strong>Time:</strong> {booking.service_time}</div>
      <div><strong>Status:</strong> {booking.status}</div>
      <div><strong>Price:</strong> {formatPrice(Number(booking.total_amount))}</div>
      {booking.specialInstructions && <div><strong>Special Instructions:</strong> {booking.specialInstructions}</div>}
      {booking.special_instructions && !booking.specialInstructions && <div><strong>Special Instructions:</strong> {booking.special_instructions}</div>}
      {booking.serviceProvider && <div><strong>Provider:</strong> {booking.serviceProvider.businessName}</div>}
    </div>
  );

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
        <Button
          onClick={handleCreateBooking}
          className="bg-blue-600 hover:bg-blue-700"
        >
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
        {!Array.isArray(bookings) || bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {!Array.isArray(bookings) ? 'Error loading bookings' : 'No bookings found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {!Array.isArray(bookings)
                ? 'There was an issue loading your bookings. Please try again.'
                : 'You haven\'t made any bookings yet.'
              }
            </p>
            <Button
              onClick={!Array.isArray(bookings) ? loadBookings : handleCreateBooking}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {!Array.isArray(bookings) ? 'Retry' : 'Browse and Book Services'}
            </Button>
          </div>
        ) : (
          (bookings as Booking[]).map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Car className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.service?.name || 'Service Name Not Available'}
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
                        {booking.scheduledDate ? formatDate(booking.scheduledDate) : formatDate(booking.service_date)} at {booking.scheduledTime || booking.service_time}
                      </span>
                    </div>

                    {(booking as any).location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{(booking as any).location.address}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(Number(booking.totalAmount ?? booking.total_amount))}</span>
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
                    <>
                      <Button
                        onClick={() => handleEditBooking(booking.id)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleCancelBooking(booking.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleViewDetails(booking.id)}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      <Modal open={showDetails} onClose={() => setShowDetails(false)} title="Booking Details">
        {selectedBooking && <BookingDetails booking={selectedBooking} />}
      </Modal>

      {/* Edit Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Booking">
        {editBooking && <EditBookingForm booking={editBooking} onSubmit={handleEditSubmit} onCancel={() => setShowEdit(false)} />}
      </Modal>
    </div>
  )
}
