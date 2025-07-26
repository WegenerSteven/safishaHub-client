import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BookingStatus } from '@/interfaces';
import { useAuth } from '@/contexts/auth-context';
import { bookingsService } from '@/services';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Car, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface BookingDetailsProps {
  bookingId: string;
  onClose?: () => void;
}

export function BookingDetails({ bookingId, onClose }: BookingDetailsProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isServiceProvider } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  
  // Load booking details
  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        const bookingData = await bookingsService.getBookingById(bookingId);
        setBooking(bookingData);
        console.log('Booking data loaded:', bookingData);
      } catch (err) {
        console.error('Failed to load booking:', err);
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBooking();
  }, [bookingId]);
  
  const handleCancel = async () => {
    if (!booking) return;
    
    try {
      setCancelling(true);
      await bookingsService.cancelBooking(booking.id);
      
      // Update booking status locally
      setBooking({
        ...booking,
        status: BookingStatus.CANCELLED
      });
      
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };
  
  const formatTime = (timeStr: string) => {
    // Format HH:MM to 12-hour format if needed
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };
  
  const getStatusBadge = (status: string) => {
    let color = 'bg-gray-100 text-gray-800';
    let icon = null;
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        color = 'bg-blue-100 text-blue-800';
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case 'completed':
        color = 'bg-green-100 text-green-800';
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case 'pending':
        color = 'bg-yellow-100 text-yellow-800';
        icon = <Clock className="h-4 w-4 mr-1" />;
        break;
      case 'cancelled':
        color = 'bg-red-100 text-red-800';
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
      case 'in_progress':
        color = 'bg-purple-100 text-purple-800';
        icon = <Loader2 className="h-4 w-4 mr-1" />;
        break;
    }
    
    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status.replace('_', ' ').toUpperCase()}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p>Loading booking details...</p>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>Booking not found or unavailable.</p>
          </div>
        </div>
        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </div>
    );
  }
  
  const isCustomer = isAuthenticated && user?.id === booking.user_id;
  const isProvider = isServiceProvider && booking.service?.provider_id === user?.id;
  const canCancel = isCustomer && ['pending', 'confirmed'].includes(booking.status?.toLowerCase());
  
  return (
    <div className="bg-white p-6 rounded-xl max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Booking #{booking.booking_number || booking.id.substring(0, 8)}</h2>
          <p className="text-gray-500">Created on {formatDate(booking.created_at || booking.createdAt)}</p>
        </div>
        {getStatusBadge(booking.status)}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Service Details */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">{booking.service?.name || 'Service'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-gray-700">
            <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Price: ${parseFloat(booking.total_amount || booking.totalAmount || '0').toFixed(2)}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Duration: {booking.service?.duration_minutes || '60'} minutes</span>
          </div>
        </div>
      </div>
      
      {/* Appointment Details */}
      <div className="mb-6 border border-gray-200 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Appointment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Date: {formatDate(booking.service_date || booking.scheduledDate)}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Time: {formatTime(booking.service_time || booking.scheduledTime)}</span>
          </div>
        </div>
      </div>
      
      {/* Customer Details - Visible only to service providers */}
      {isProvider && booking.user && (
        <div className="mb-6 border border-gray-200 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Customer Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-700">
              <User className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{booking.user.name || booking.user.first_name} {booking.user.last_name || ''}</span>
            </div>
            
            {(booking.user.phone || booking.user.phone_number) && (
              <div className="flex items-center text-gray-700">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{booking.user.phone || booking.user.phone_number}</span>
              </div>
            )}
            
            {booking.user.email && (
              <div className="flex items-center text-gray-700">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{booking.user.email}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Vehicle Information */}
      {booking.vehicle_info && (
        <div className="mb-6 border border-gray-200 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Vehicle Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {booking.vehicle_info.type && (
              <div className="text-gray-700">
                <span className="font-medium">Type:</span> {booking.vehicle_info.type}
              </div>
            )}
            
            {booking.vehicle_info.make && (
              <div className="text-gray-700">
                <span className="font-medium">Make:</span> {booking.vehicle_info.make}
              </div>
            )}
            
            {booking.vehicle_info.model && (
              <div className="text-gray-700">
                <span className="font-medium">Model:</span> {booking.vehicle_info.model}
              </div>
            )}
            
            {booking.vehicle_info.year && (
              <div className="text-gray-700">
                <span className="font-medium">Year:</span> {booking.vehicle_info.year}
              </div>
            )}
            
            {booking.vehicle_info.license_plate && (
              <div className="text-gray-700">
                <span className="font-medium">License Plate:</span> {booking.vehicle_info.license_plate}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Special Instructions */}
      {(booking.special_instructions || booking.specialInstructions) && (
        <div className="mb-6 border border-gray-200 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Special Instructions</h3>
          <p className="text-gray-700 text-sm">
            {booking.special_instructions || booking.specialInstructions}
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-8">
        <Button 
          variant="outline"
          onClick={onClose}
        >
          Close
        </Button>
        
        {canCancel && (
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </Button>
        )}
        
        {/* Providers might have additional actions like "Mark Complete" */}
        {isProvider && booking.status === BookingStatus.CONFIRMED && (
          <Button className="bg-green-600 hover:bg-green-700">
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );
}
