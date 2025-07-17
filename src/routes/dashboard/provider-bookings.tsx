import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, Calendar, Clock, User, AlertCircle, Search, PhoneCall, Car } from 'lucide-react'
import { serviceProviderDashboardService } from '@/services'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { BookingStatus } from '@/interfaces'
import type { Booking } from '@/interfaces/booking/Booking.interface'
import type { ExtendedBooking, BookingFilterParams } from '@/services/service-provider-dashboard.service'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/dashboard/provider-bookings')({
  component: ProviderBookingsPage,
})

function ProviderBookingsPage() {
  const { user, isAuthenticated, isServiceProvider } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'confirm' | 'cancel' | 'complete' | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(10) // Items per page

  // Load bookings when authentication state or pagination changes
  useEffect(() => {
    if (isAuthenticated && isServiceProvider) {
      loadProviderBookings()
    }
  }, [isAuthenticated, isServiceProvider, currentPage])

  // Filter displayed bookings when filters change
  useEffect(() => {
    filterBookings()
  }, [bookings, searchQuery, statusFilter, dateFilter, activeTab])

  const loadProviderBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: BookingFilterParams = {
        status: activeTab !== 'all' ? activeTab as BookingStatus : undefined,
        page: currentPage,
        limit: 10
      };

      const response = await serviceProviderDashboardService.getProviderBookings(filters)
      setBookings(response.data || [])
      setFilteredBookings(response.data || [])
      setTotalPages(response.meta?.totalPages || 1)
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setError('Failed to load provider bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(booking => booking.status === activeTab)
    }

    // Filter by search query (customer name, booking number, etc.)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(booking =>
        (booking.user?.first_name?.toLowerCase().includes(query) || '') ||
        (booking.user?.last_name?.toLowerCase().includes(query) || '') ||
        (booking.booking_number?.toLowerCase().includes(query) || '') ||
        (booking.id?.toLowerCase().includes(query) || '')
      )
    }

    // Filter by status if not already filtered by tab
    if (statusFilter !== 'all' && activeTab === 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const tomorrow = new Date(today + 86400000).getTime()
      const nextWeek = new Date(today + 7 * 86400000).getTime()

      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.service_date).getTime()

        if (dateFilter === 'today') {
          return bookingDate >= today && bookingDate < tomorrow
        } else if (dateFilter === 'tomorrow') {
          return bookingDate >= tomorrow && bookingDate < (tomorrow + 86400000)
        } else if (dateFilter === 'week') {
          return bookingDate >= today && bookingDate < nextWeek
        }
        return true
      })
    }

    setFilteredBookings(filtered)
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      // Use the dashboard service to update booking status
      await serviceProviderDashboardService.updateBookingStatus(bookingId, newStatus)

      // Update local state
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      ))

      // Close dialog if open
      setIsActionDialogOpen(false)

      // Update selected booking if it's the one being updated
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          status: newStatus
        })
      }

      // Show success message
      toast.success("Status updated", {
        description: `Booking status has been updated to ${newStatus}`
      });
    } catch (err) {
      console.error('Failed to update booking status:', err)

      // Show error toast
      toast.error("Update failed", {
        description: "Failed to update booking status. Please try again."
      });
    }
  }

  const openDetailsModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailsOpen(true)
  }

  const openActionDialog = (type: 'confirm' | 'cancel' | 'complete', booking: Booking) => {
    setSelectedBooking(booking)
    setActionType(type)
    setIsActionDialogOpen(true)
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
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Your Service Bookings</h1>
        <Button onClick={loadProviderBookings} className="bg-blue-600">
          Refresh Bookings
        </Button>
      </div>

      {/* Tabs for quick filtering */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.PENDING}>
            Pending ({bookings.filter(b => b.status === BookingStatus.PENDING).length})
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.CONFIRMED}>
            Confirmed ({bookings.filter(b => b.status === BookingStatus.CONFIRMED).length})
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.COMPLETED}>
            Completed ({bookings.filter(b => b.status === BookingStatus.COMPLETED).length})
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.CANCELLED}>
            Cancelled ({bookings.filter(b => b.status === BookingStatus.CANCELLED).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search bookings by customer name or booking ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="week">This week</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={BookingStatus.CONFIRMED}>Confirmed</SelectItem>
              <SelectItem value={BookingStatus.IN_PROGRESS}>In progress</SelectItem>
              <SelectItem value={BookingStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={BookingStatus.CANCELLED}>Cancelled</SelectItem>
              <SelectItem value={BookingStatus.NO_SHOW}>No show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-medium mb-2">No bookings found</h2>
          <p className="text-gray-600 mb-4">
            {bookings.length === 0
              ? "You don't have any bookings yet. Check back later."
              : "No bookings match your current filters."}
          </p>
          {bookings.length > 0 && (
            <Button variant="outline" onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setDateFilter('all')
              setActiveTab('all')
            }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Booking #{booking.booking_number || booking.id.substring(0, 8)}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">{booking.service?.name || 'Car Wash Service'}</p>
                  <p>KSh {parseFloat(booking.total_amount || '0').toFixed(2)}</p>
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
                        {booking.user.phone_number && <p>{booking.user.phone_number}</p>}
                      </>
                    ) : (
                      <p>Customer information not available</p>
                    )}
                  </div>
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  className="w-full mt-2 text-blue-600 border-blue-200"
                  onClick={() => openDetailsModal(booking)}
                >
                  View Details
                </Button>
              </div>

              {/* Actions */}
              <div className="p-4 border-t bg-gray-50">
                {booking.status === BookingStatus.PENDING && (
                  <div className="flex space-x-2">
                    <Button
                      className="w-full bg-blue-600"
                      onClick={() => openActionDialog('confirm', booking)}
                    >
                      Confirm
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={() => openActionDialog('cancel', booking)}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {booking.status === BookingStatus.CONFIRMED && (
                  <div className="flex space-x-2">
                    <Button
                      className="w-full bg-blue-600"
                      onClick={() => handleUpdateStatus(booking.id, BookingStatus.IN_PROGRESS)}
                    >
                      Start Service
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => openActionDialog('cancel', booking)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {booking.status === BookingStatus.IN_PROGRESS && (
                  <Button
                    className="w-full bg-green-600"
                    onClick={() => openActionDialog('complete', booking)}
                  >
                    Complete Service
                  </Button>
                )}

                {(booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => openDetailsModal(booking)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-blue-600" : ""}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Booking Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between">
              <span>Booking Details</span>
              {selectedBooking && (
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status.toUpperCase()}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Booking ID</h3>
                  <p>#{selectedBooking.booking_number || selectedBooking.id.substring(0, 8)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Service</h3>
                  <p>{selectedBooking.service?.name || 'Car Wash Service'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Date</h3>
                  <p>{formatDate(selectedBooking.service_date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Time</h3>
                  <p>{formatTime(selectedBooking.service_time)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Amount</h3>
                  <p>KSh {parseFloat(selectedBooking.total_amount || '0').toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Booked On</h3>
                  <p>{formatDate(selectedBooking.created_at)}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h3>
                {selectedBooking.user ? (
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <p>{selectedBooking.user.first_name} {selectedBooking.user.last_name}</p>
                    </div>
                    {selectedBooking.user.phone_number && (
                      <div className="flex items-center">
                        <PhoneCall className="h-4 w-4 mr-2 text-gray-500" />
                        <p>{selectedBooking.user.phone_number}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Customer information not available</p>
                )}
              </div>

              {selectedBooking.vehicle_info && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Vehicle Information</h3>
                  <div className="flex items-start">
                    <Car className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p>{selectedBooking.vehicle_info.type} {selectedBooking.vehicle_info.make} {selectedBooking.vehicle_info.model}</p>
                      {selectedBooking.vehicle_info.license_plate && (
                        <p className="text-sm text-gray-600">Plate: {selectedBooking.vehicle_info.license_plate}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedBooking.special_instructions && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Special Instructions</h3>
                  <p className="text-sm text-gray-600">{selectedBooking.special_instructions}</p>
                </div>
              )}

              <DialogFooter className="border-t border-gray-200 pt-4">
                {selectedBooking.status === BookingStatus.PENDING && (
                  <div className="flex space-x-2 w-full">
                    <Button
                      className="flex-1 bg-blue-600"
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, BookingStatus.CONFIRMED)
                        setIsDetailsOpen(false)
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, BookingStatus.CANCELLED)
                        setIsDetailsOpen(false)
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {selectedBooking.status === BookingStatus.CONFIRMED && (
                  <div className="flex space-x-2 w-full">
                    <Button
                      className="flex-1 bg-blue-600"
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, BookingStatus.IN_PROGRESS)
                        setIsDetailsOpen(false)
                      }}
                    >
                      Start Service
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, BookingStatus.CANCELLED)
                        setIsDetailsOpen(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {selectedBooking.status === BookingStatus.IN_PROGRESS && (
                  <Button
                    className="w-full bg-green-600"
                    onClick={() => {
                      handleUpdateStatus(selectedBooking.id, BookingStatus.COMPLETED)
                      setIsDetailsOpen(false)
                    }}
                  >
                    Complete Service
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'confirm' && "Confirm Booking"}
              {actionType === 'cancel' && "Cancel Booking"}
              {actionType === 'complete' && "Complete Service"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'confirm' && "Are you sure you want to confirm this booking? The customer will be notified."}
              {actionType === 'cancel' && "Are you sure you want to cancel this booking? This action cannot be undone."}
              {actionType === 'complete' && "Mark this service as completed? This will finalize the booking and notify the customer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedBooking) {
                  if (actionType === 'confirm') {
                    handleUpdateStatus(selectedBooking.id, BookingStatus.CONFIRMED)
                  } else if (actionType === 'cancel') {
                    handleUpdateStatus(selectedBooking.id, BookingStatus.CANCELLED)
                  } else if (actionType === 'complete') {
                    handleUpdateStatus(selectedBooking.id, BookingStatus.COMPLETED)
                  }
                }
              }}
              className={
                actionType === 'confirm' ? "bg-blue-600 hover:bg-blue-700" :
                  actionType === 'cancel' ? "bg-red-600 hover:bg-red-700" :
                    "bg-green-600 hover:bg-green-700"
              }
            >
              Yes, {actionType === 'confirm' ? 'confirm' : actionType === 'cancel' ? 'cancel' : 'complete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
