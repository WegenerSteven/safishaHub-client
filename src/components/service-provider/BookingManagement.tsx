import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import bookingsService from '@/services/bookings.service.instance'
import { Calendar, Clock, Check, MoreHorizontal, AlertCircle, PhoneCall, Mail } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { Booking } from '@/interfaces'
import { BookingStatus } from '@/interfaces'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function BookingManagement() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<BookingStatus | ''>('')
  const [statusNote, setStatusNote] = useState('')

  const queryClient = useQueryClient()

  // Fetch bookings
  const { 
    data: bookings = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn: bookingsService.getProviderBookings,
  })

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      bookingsService.updateBooking(id, { status }),
    onSuccess: () => {
      toast.success("The booking status has been updated successfully.")
      setIsUpdateStatusDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] })
      resetStatusForm()
    },
    onError: (error) => {
      console.error('Error updating booking:', error)
      toast.error("Failed to update booking status. Please try again.")
    },
  })

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: bookingsService.cancelBooking,
    onSuccess: () => {
      toast.success("The booking has been cancelled.")
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] })
    },
    onError: (error) => {
      console.error('Error cancelling booking:', error)
      toast.error("Failed to cancel booking. Please try again.")
    },
  })

  // Handle opening booking details
  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailsDialogOpen(true)
  }

  // Handle opening status update dialog
  const openUpdateStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setNewStatus(booking.status)
    setIsUpdateStatusDialogOpen(true)
  }

  // Handle status update
  const handleUpdateStatus = () => {
    if (selectedBooking?.id && newStatus) {
      updateBookingMutation.mutate({ 
        id: selectedBooking.id, 
        status: newStatus 
      })
    }
  }

  // Handle booking cancellation
  const handleCancelBooking = (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(id)
    }
  }

  // Reset status form
  const resetStatusForm = () => {
    setNewStatus('')
    setStatusNote('')
    setSelectedBooking(null)
  }

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (error) {
      return dateString
    }
  }

  // Filter bookings by status
  const pendingBookings = bookings.filter(booking => 
    booking.status === BookingStatus.PENDING || 
    booking.status === BookingStatus.CONFIRMED
  )
  const activeBookings = bookings.filter(booking => 
    booking.status === BookingStatus.IN_PROGRESS
  )
  const completedBookings = bookings.filter(booking => 
    booking.status === BookingStatus.COMPLETED
  )
  const cancelledBookings = bookings.filter(booking => 
    booking.status === BookingStatus.CANCELLED || 
    booking.status === BookingStatus.NO_SHOW
  )

  // Status badge color mapping
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'secondary'
      case BookingStatus.CONFIRMED:
        return 'secondary'
      case BookingStatus.IN_PROGRESS:
        return 'default'
      case BookingStatus.COMPLETED:
        return 'success'
      case BookingStatus.CANCELLED:
        return 'destructive'
      case BookingStatus.NO_SHOW:
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-destructive mb-2" />
        <h2 className="text-2xl font-semibold">Error Loading Bookings</h2>
        <p className="text-muted-foreground">
          Please try refreshing the page or check your connection.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Booking Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {/* Render each tab content with appropriate bookings */}
        {['pending', 'active', 'completed', 'cancelled'].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue}>
            <BookingsTable 
              bookings={
                tabValue === 'pending' ? pendingBookings :
                tabValue === 'active' ? activeBookings :
                tabValue === 'completed' ? completedBookings :
                cancelledBookings
              }
              onViewDetails={openBookingDetails}
              onUpdateStatus={openUpdateStatusDialog}
              onCancelBooking={handleCancelBooking}
              formatDate={formatDate}
              getStatusBadgeVariant={getStatusBadgeVariant}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Booking Number</h3>
                <p>{selectedBooking.booking_number || selectedBooking.id}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={getStatusBadgeVariant(selectedBooking.status)}>
                  {selectedBooking.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Service</h3>
                <p>{selectedBooking.service?.name || 'Unknown Service'}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Date & Time</h3>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(selectedBooking.service_date)}
                  <Clock className="h-4 w-4 ml-2 mr-1" />
                  {selectedBooking.service_time}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Total Amount</h3>
                <p>KES {selectedBooking.total_amount}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Payment Status</h3>
                <Badge variant={selectedBooking.payment?.status === 'paid' ? 'success' : 'outline'}>
                  {selectedBooking.payment?.status?.toUpperCase() || 'PENDING'}
                </Badge>
              </div>
              
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-20">Name:</span>
                    <span>{selectedBooking.user?.first_name} {selectedBooking.user?.last_name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-20">Phone:</span>
                    <span className="flex items-center">
                      {selectedBooking.user?.phone_number}
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-20">Email:</span>
                    <span className="flex items-center">
                      {selectedBooking.user?.email}
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.vehicle_info && (
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <h3 className="font-medium mb-2">Vehicle Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <p>{selectedBooking.vehicle_info.type}</p>
                    </div>
                    {selectedBooking.vehicle_info.make && (
                      <div>
                        <span className="text-sm text-muted-foreground">Make:</span>
                        <p>{selectedBooking.vehicle_info.make}</p>
                      </div>
                    )}
                    {selectedBooking.vehicle_info.model && (
                      <div>
                        <span className="text-sm text-muted-foreground">Model:</span>
                        <p>{selectedBooking.vehicle_info.model}</p>
                      </div>
                    )}
                    {selectedBooking.vehicle_info.year && (
                      <div>
                        <span className="text-sm text-muted-foreground">Year:</span>
                        <p>{selectedBooking.vehicle_info.year}</p>
                      </div>
                    )}
                    {selectedBooking.vehicle_info.license_plate && (
                      <div>
                        <span className="text-sm text-muted-foreground">License Plate:</span>
                        <p>{selectedBooking.vehicle_info.license_plate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.special_instructions && (
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <h3 className="font-medium mb-2">Special Instructions</h3>
                  <p className="text-sm">{selectedBooking.special_instructions}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedBooking && selectedBooking.status !== BookingStatus.COMPLETED && selectedBooking.status !== BookingStatus.CANCELLED && (
              <Button onClick={() => {
                setIsDetailsDialogOpen(false);
                openUpdateStatusDialog(selectedBooking);
              }}>
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of booking #{selectedBooking?.booking_number || selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div>
                <Badge variant={selectedBooking ? getStatusBadgeVariant(selectedBooking.status) : 'outline'}>
                  {selectedBooking?.status.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>New Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(BookingStatus).map(status => (
                  <Button
                    key={status}
                    type="button"
                    variant={newStatus === status ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setNewStatus(status)}
                  >
                    {status === newStatus && <Check className="mr-2 h-4 w-4" />}
                    {status.replace('_', ' ').toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-note">Note (optional)</Label>
              <Textarea
                id="status-note"
                placeholder="Add any notes about this status change"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={!newStatus || newStatus === selectedBooking?.status || updateBookingMutation.isPending}
            >
              {updateBookingMutation.isPending && (
                <span className="animate-spin mr-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface BookingsTableProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onUpdateStatus: (booking: Booking) => void;
  onCancelBooking: (id: string) => void;
  formatDate: (date: string) => string;
  getStatusBadgeVariant: (status: string) => string;
}

function BookingsTable({ 
  bookings, 
  onViewDetails, 
  onUpdateStatus, 
  onCancelBooking,
  formatDate,
  getStatusBadgeVariant
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border rounded-md bg-muted/50">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Bookings Found</h3>
        <p className="text-muted-foreground text-center">
          There are no bookings in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">
                {booking.booking_number?.substring(0, 8) || 
                 booking.id?.substring(0, 8) || 
                 'N/A'}
              </TableCell>
              <TableCell>{booking.service?.name || 'Unknown Service'}</TableCell>
              <TableCell>
                {booking.user?.first_name} {booking.user?.last_name}
              </TableCell>
              <TableCell>{formatDate(booking.service_date)}</TableCell>
              <TableCell>{booking.service_time}</TableCell>
              <TableCell>KES {booking.total_amount}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(booking.status)}>
                  {booking.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(booking)}>
                      View Details
                    </DropdownMenuItem>
                    
                    {booking.status !== BookingStatus.COMPLETED && 
                     booking.status !== BookingStatus.CANCELLED && 
                     booking.status !== BookingStatus.NO_SHOW && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(booking)}>
                        Update Status
                      </DropdownMenuItem>
                    )}
                    
                    {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) && (
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => onCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
