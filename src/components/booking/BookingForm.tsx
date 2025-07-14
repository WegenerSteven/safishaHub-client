import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BookingStatus, ServiceType } from '@/interfaces';
import { useAuth } from '@/contexts/auth-context';
import { bookingsService, servicesService, notificationsService } from '@/services';
import type { CreateBookingRequest } from '@/services/bookings.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  Car, 
  Info, 
  CreditCard,
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface BookingFormProps {
  serviceId: string;
  onClose?: () => void;
  onSuccess?: (bookingId: string) => void;
}

export function BookingForm({ serviceId, onClose, onSuccess }: BookingFormProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Service data
  const [service, setService] = useState<any>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  
  // Form fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [vehicleType, setVehicleType] = useState('sedan');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState<number | undefined>(undefined);
  const [vehiclePlate, setVehiclePlate] = useState('');
  
  // Load service details
  useEffect(() => {
    const loadService = async () => {
      try {
        setServiceLoading(true);
        const serviceData = await servicesService.getServiceById(serviceId);
        setService(serviceData);
        console.log('Service data loaded:', serviceData);
      } catch (err) {
        console.error('Failed to load service:', err);
        setError('Failed to load service details. Please try again.');
      } finally {
        setServiceLoading(false);
      }
    };
    
    loadService();
  }, [serviceId]);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please log in to book a service.');
    }
  }, [isAuthenticated]);
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('Please log in to book a service.');
      alert('You need to be logged in to book a service. Please log in and try again.');
      // Redirect to login page
      navigate({ to: '/login' });
      return;
    }
    
    if (!service) {
      setError('Service details are not available.');
      return;
    }
    
    // Form validation
    if (!date) {
      setError('Please select a service date.');
      return;
    }
    
    if (!time) {
      setError('Please select a service time.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Current user:', user);
      
      // Prepare booking data
      const bookingData: CreateBookingRequest = {
        user_id: user.id, // Make sure user.id exists
        service_id: serviceId,
        service_date: date,
        service_time: time,
        total_amount: parseFloat(service.base_price || '0'),
        special_instructions: specialInstructions || undefined,
        vehicle_info: {
          type: vehicleType,
          make: vehicleMake || undefined,
          model: vehicleModel || undefined,
          year: vehicleYear || undefined,
          license_plate: vehiclePlate || undefined,
        }
      };
      
      // Send booking request to API
      const result = await bookingsService.createBooking(bookingData);
      
      // Send notifications to service provider
      try {
        // Get provider ID from service data
        const providerId = service.provider_id || service.provider?.id;
        
        if (providerId) {
          // Send in-app notification
          await notificationsService.sendBookingNotification(
            providerId,
            result.id,
            `${user.first_name || user.name || 'Customer'}`,
            service.name,
            date
          );
          
          // Send email notification if provider has email
          if (service.provider?.email) {
            await notificationsService.sendEmailNotification(
              service.provider.email,
              'New Booking Notification',
              `You have a new booking for ${service.name} on ${date} at ${time}.`,
              {
                service_name: service.name,
                customer_name: `${user.first_name || user.name || 'Customer'}`,
                booking_date: date,
                booking_time: time
              }
            );
          }
          
          // Send SMS notification if provider has phone
          if (service.provider?.phone || service.provider?.business_phone) {
            const phone = service.provider?.phone || service.provider?.business_phone;
            await notificationsService.sendSmsNotification(
              phone,
              `New booking: ${service.name} on ${date} at ${time} by ${user.first_name || user.name || 'Customer'}.`
            );
          }
        }
      } catch (notificationError) {
        // Log but don't fail the booking process
        console.error('Failed to send notifications:', notificationError);
      }
      
      // Handle success
      setSuccess('Booking created successfully! Redirecting to your bookings...');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result.id);
      } else {
        // Redirect to bookings page after 2 seconds
        setTimeout(() => {
          navigate({ to: '/dashboard/bookings' });
        }, 2000);
      }
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (serviceLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p>Loading service details...</p>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>Service not found or unavailable.</p>
          </div>
        </div>
        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Book Service</h2>
      
      {/* Service Summary */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
        <div className="flex items-center text-gray-700 mb-2">
          <CreditCard className="h-4 w-4 mr-2" />
          <span>Price: ${parseFloat(service.base_price || '0').toFixed(2)}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <Clock className="h-4 w-4 mr-2" />
          <span>Duration: {service.duration_minutes} minutes</span>
        </div>
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
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
          <p>{success}</p>
        </div>
      )}
      
      {/* Booking Form */}
      {isAuthenticated && !success && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            {/* Vehicle Information */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800 flex items-center">
                <Car className="h-4 w-4 mr-2" />
                Vehicle Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    className="rounded-md border border-gray-300 py-2 px-3 bg-white text-gray-700 w-full"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    required
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="coupe">Coupe</option>
                    <option value="wagon">Wagon</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make
                  </label>
                  <Input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="Toyota, Honda, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <Input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Camry, Civic, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <Input
                    type="number"
                    value={vehicleYear || ''}
                    onChange={(e) => setVehicleYear(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="2022"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Plate
                </label>
                <Input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="ABC-1234"
                />
              </div>
            </div>
            
            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Special Instructions
              </label>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any additional information or special requests..."
                rows={3}
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button 
                type="button" 
                onClick={onClose} 
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !isAuthenticated}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
      
      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="mt-4">
          <Button 
            onClick={() => navigate({ to: '/login', search: { returnTo: `/services` } })} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Login to Book This Service
          </Button>
        </div>
      )}
    </div>
  );
}
