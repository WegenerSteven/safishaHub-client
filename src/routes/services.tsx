import { createFileRoute } from '@tanstack/react-router'
import { Clock, Loader2, MapPin, Star, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import type { Service, User } from '@/interfaces'
import type { Business } from '@/interfaces/business/Business.interface'
import { ServiceType, ServiceStatus } from '@/interfaces/service/Service.interface'
import { servicesService } from '@/services'
import { toast } from 'sonner';
import { BookingModal } from '@/components/booking'
import { useAuth } from '@/contexts/auth-context'

// Extended interface for service with provider and business details
interface ServiceWithProvider extends Service {
  provider?: User;
  business?: Business;
}

export const Route = createFileRoute('/services')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isAuthenticated, user } = useAuth();
  const [services, setServices] = useState<ServiceWithProvider[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceWithProvider[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServiceType, setSelectedServiceType] = useState<string>('All')
  // const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Booking state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  useEffect(() => {
    loadServicesData()
  }, [])

  // Apply filters whenever search term or selected service type changes
  useEffect(() => {
    filterServices()
  }, [searchTerm, selectedServiceType, services])

  const filterServices = () => {
    let result = [...services];

    // Filter by search term if provided
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(service => {
        // Search in service name and description
        const nameMatch = service.name?.toLowerCase().includes(lowercasedTerm);
        const descMatch = service.description?.toLowerCase().includes(lowercasedTerm);

        // Search in business info if available
        const businessNameMatch = service.business?.name?.toLowerCase().includes(lowercasedTerm);
        const businessCityMatch = service.business?.city?.toLowerCase().includes(lowercasedTerm);

        // Search in provider info if available
        const providerNameMatch = service.provider?.business_name?.toLowerCase().includes(lowercasedTerm);
        const providerCityMatch = service.provider?.city?.toLowerCase().includes(lowercasedTerm);

        return nameMatch || descMatch || businessNameMatch || businessCityMatch || providerNameMatch || providerCityMatch;
      });
    }

    // Filter by service type if not "All"
    if (selectedServiceType !== 'All') {
      result = result.filter(service => service.service_type === selectedServiceType);
    }

    setFilteredServices(result);
  };

  const loadServicesData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load services directly from API - no mock data fallback
      const servicesData = await servicesService.getServices({ status: ServiceStatus.ACTIVE })
      console.log('Services data received:', servicesData)

      // Ensure we have an array of services
      if (servicesData && Array.isArray(servicesData)) {
        setServices(servicesData)
        setFilteredServices(servicesData) // Initialize filtered services
        console.log('Successfully loaded', servicesData.length, 'services from database')
      } else {
        console.error('Services data is not an array:', servicesData)
        setError('Invalid data format received from server.')
        setServices([]) // Set empty array instead of mock data
        setFilteredServices([]) // Update filtered services
      }
    } catch (err) {
      console.error('Failed to load services data:', err)
      setError('Failed to load services. Please try again later.')
      setServices([]) // Set empty array instead of mock data
      setFilteredServices([]) // Update filtered services
    } finally {
      setLoading(false)
    }
  }

  // Function removed as it's not being used

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getCurrentOperatingStatus = (operatingHours: any) => {
    if (!operatingHours) return { isOpen: false, status: 'Hours not available' };

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const todayHours = operatingHours[today];
    if (!todayHours || todayHours.closed) {
      return { isOpen: false, status: 'Closed today' };
    }

    const { open, close } = todayHours;
    if (currentTime >= open && currentTime <= close) {
      return { isOpen: true, status: `${open} - ${close}` };
    }

    return { isOpen: false, status: `${open} - ${close}` };
  }

  // Handle booking
  const handleBookService = (service: ServiceWithProvider) => {
    console.log('handleBookService called, isAuthenticated:', isAuthenticated);
    console.log('User object:', user); // Use the user object already available from context

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, showing login modal');
      // Trigger the login modal instead of alert
      const loginRequestEvent = new CustomEvent('request-login');
      window.dispatchEvent(loginRequestEvent);
      return;
    }

    console.log('User is authenticated, proceeding with booking');
    console.log('Booking service:', service.id, service.name);
    setSelectedServiceId(service.id);
    setIsBookingModalOpen(true);
  };

  // Handle booking success
  const handleBookingSuccess = (bookingId: string) => {
    // Show success toast notification using Sonner
    toast.success(`Booking created successfully! Booking ID: ${bookingId}`);
    setIsBookingModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-primary" />
          <p className="text-gray-600 dark:text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-background dark:via-card dark:to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-foreground mb-6">
              Car Wash Services
            </h1>
            <p className="text-xl text-gray-600 dark:text-muted-foreground mb-12 max-w-3xl mx-auto">
              Professional car wash services tailored to your needs.
              From quick washes to premium detailing, we have the perfect service for every budget.
            </p>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <section className="py-8 bg-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button
                onClick={loadServicesData}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Bar */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Find Car Wash Services
                </h2>
                <p className="text-gray-600 mb-4">
                  {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
                </p>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 w-full sm:min-w-[300px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search services by name, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-2 w-full"
                  />
                </div>

                {/* Service Type Filter */}
                <div className="flex items-center space-x-2">
                  <select
                    className="rounded-md border border-gray-300 py-2 px-3 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                  >
                    <option value="All">All Services</option>
                    <option value={ServiceType.BASIC}>Basic</option>
                    <option value={ServiceType.PREMIUM}>Premium</option>
                    <option value={ServiceType.DELUXE}>Deluxe</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No services available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => {
                const isPopular = service.service_type === ServiceType.PREMIUM
                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isPopular ? 'border border-blue-500 relative' : ''
                      }`}
                  >
                    {isPopular && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Service Image/Header */}
                    <div className="h-48 w-full bg-gray-200 relative">
                      {service.image_url && (
                        <img src={service.image_url} alt={service.name} className="h-48 w-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex flex-col justify-end p-4">
                        <div className="inline-block bg-white/90 rounded-lg px-3 py-1 text-sm font-medium text-gray-900 mb-2">
                          {service.service_type === ServiceType.BASIC ? 'Basic Wash' :
                            service.service_type === ServiceType.PREMIUM ? 'Premium Detail' :
                              'Full Service'}
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {service.name}
                        </h3>
                      </div>
                    </div>

                    {/* Business/Provider Information */}
                    {(service.business || service.provider) && (
                      <div className="p-4">
                        {/* Business info takes precedence when available */}
                        {service.business ? (
                          <>
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                              {service.business.name}
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-sm text-gray-600">
                                  {service.business.city && service.business.state
                                    ? `${service.business.city}, ${service.business.state}`
                                    : service.business.business_address
                                  }
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center mb-3">
                              <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium ml-1">{service.business.rating || 0}</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                              {service.business.description}
                            </p>

                            {/* Operating Hours */}
                            {/* <div className="flex items-center mb-3">
                              <Clock className="h-4 w-4 text-gray-600 mr-1" />
                              <span className={`text-sm ${getCurrentOperatingStatus(service.business.operating_hours?.hours)?.isOpen
                                ? 'text-green-600'
                                : 'text-gray-600'
                                }`}>
                                {getCurrentOperatingStatus(service.business.operating_hours?.hours)?.status}
                              </span>
                            </div> */}
                          </>
                        ) : (
                          <>
                            {/* Fall back to provider info if business not available */}
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                              {service.provider?.business_name}
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-sm text-gray-600">
                                  {service.provider?.city && service.provider?.state
                                    ? `${service.provider.city}, ${service.provider.state}`
                                    : service.provider?.business_address
                                  }
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center mb-3">
                              <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium ml-1">{service.provider?.rating || 0}</span>
                              </div>
                            </div>

                            {service.provider?.business_description && (
                              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                {service.provider.business_description}
                              </p>
                            )}

                            {/* Operating Hours */}
                            {service.provider?.operating_hours && (
                              <div className="flex items-center mb-3">
                                <Clock className="h-4 w-4 text-gray-600 mr-1" />
                                <span className={`text-sm ${getCurrentOperatingStatus(service.provider.operating_hours)?.isOpen
                                  ? 'text-green-600'
                                  : 'text-gray-600'
                                  }`}>
                                  {getCurrentOperatingStatus(service.provider.operating_hours)?.status}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Service Features */}
                    {/* <div className="px-4 py-2">
                      <div className="text-sm text-gray-600">
                        Services ({service.features?.length || 0})
                      </div>

                      {service.features && service.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {service.features.slice(0, 3).map((feature, featureIndex) => (
                            <div key={featureIndex} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {feature}
                            </div>
                          ))}
                        </div>
                      )}
                    </div> */}

                    {/* Price & Action Buttons */}
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Starting from</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatPrice(parseFloat(String(service.base_price ?? '0')), 'KES')}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => alert(`Exploring details of ${service.name}`)}
                        >
                          Explore
                        </Button>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleBookService(service)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedServiceId && isBookingModalOpen && (
        <BookingModal
          serviceId={selectedServiceId}
          isOpen={true}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedServiceId(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )

  // Function removed as it's not being used
}
