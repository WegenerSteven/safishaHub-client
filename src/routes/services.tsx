import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle, Clock, Crown, Droplets, Sparkles, Loader2, MapPin, Star, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import type { Service, User } from '@/interfaces'
import type { Business } from '@/interfaces/business/Business.interface'
import { ServiceType, ServiceStatus } from '@/interfaces/service/Service.interface'
import { servicesService } from '@/services'

// Extended interface for service with provider and business details
interface ServiceWithProvider extends Service {
  provider?: User;
  business?: Business;
}

export const Route = createFileRoute('/services')({
  component: RouteComponent,
})

function RouteComponent() {
  const [services, setServices] = useState<ServiceWithProvider[]>([])
  // const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadServicesData()
  }, [])

  const loadServicesData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load services directly from API - no mock data fallback
      const servicesData = await servicesService.getAllServices({ is_available: true, status: ServiceStatus.ACTIVE })
      console.log('Services data received:', servicesData)
      
      // Ensure we have an array of services
      if (servicesData && Array.isArray(servicesData)) {
        setServices(servicesData)
        console.log('Successfully loaded', servicesData.length, 'services from database')
      } else {
        console.error('Services data is not an array:', servicesData)
        setError('Invalid data format received from server.')
        setServices([]) // Set empty array instead of mock data
      }
    } catch (err) {
      console.error('Failed to load services data:', err)
      setError('Failed to load services. Please try again later.')
      setServices([]) // Set empty array instead of mock data
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (serviceType: ServiceType) => {
    switch (serviceType) {
      case ServiceType.BASIC:
        return Droplets
      case ServiceType.PREMIUM:
        return Sparkles
      case ServiceType.DELUXE:
        return Crown
      default:
        return Droplets
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
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
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No services available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const IconComponent = getServiceIcon(service.service_type)
                const isPopular = service.service_type === ServiceType.PREMIUM
                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                      isPopular ? 'border-2 border-blue-500 relative scale-105' : ''
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    
                    {/* Business/Provider Information */}
                    {(service.business || service.provider) && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        {/* Business info takes precedence when available */}
                        {service.business ? (
                          <>
                            <div className="text-lg font-semibold text-blue-600 mb-2">
                              {service.business.name}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">{service.business.type}</span>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                              {service.business.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>
                                  {service.business.city && service.business.state 
                                    ? `${service.business.city}, ${service.business.state}`
                                    : service.business.address
                                  }
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                <span>{service.business.phone}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                                <span className="font-medium">{service.business.rating || 0}/5</span>
                                <span className="text-gray-400 ml-1">
                                  ({service.business.total_reviews || 0} reviews)
                                </span>
                              </div>
                              
                              {/* Operating Hours - Show current day status */}
                              {service.business.operating_hours?.hours && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span className={getCurrentOperatingStatus(service.business.operating_hours.hours)?.isOpen 
                                    ? 'text-green-600 font-medium' 
                                    : 'text-red-600 font-medium'
                                  }>
                                    {getCurrentOperatingStatus(service.business.operating_hours.hours)?.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Fall back to provider info if business not available */}
                            <div className="text-lg font-semibold text-blue-600 mb-2">
                              {service.provider?.business_name}
                            </div>
                            
                            {service.provider?.business_type && (
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{service.provider.business_type}</span>
                              </div>
                            )}
                            
                            {service.provider?.business_description && (
                              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                {service.provider.business_description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>
                                  {service.provider?.city && service.provider.state 
                                    ? `${service.provider.city}, ${service.provider.state}`
                                    : service.provider?.business_address
                                  }
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                <span>{service.provider?.business_phone || service.provider?.phone}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                                <span className="font-medium">{service.provider?.rating || 0}/5</span>
                                <span className="text-gray-400 ml-1">
                                  ({service.provider?.total_reviews || 0} reviews)
                                </span>
                              </div>
                              
                              {/* Operating Hours - Show current day status */}
                              {service.provider?.operating_hours && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span className={getCurrentOperatingStatus(service.provider.operating_hours)?.isOpen 
                                    ? 'text-green-600 font-medium' 
                                    : 'text-red-600 font-medium'
                                  }>
                                    {getCurrentOperatingStatus(service.provider.operating_hours)?.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="text-4xl font-bold text-blue-600 mb-4">
                      {formatPrice(parseFloat(service.base_price || '0'), 'USD')} {/* Default to USD since API doesn't return currency */}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                      
                      {service.description && (
                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      )}
                      
                      {service.features && service.features.length > 0 && (
                        <div className="text-left space-y-2">
                          {service.features.slice(0, 4).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                      onClick={() => handleSelectService(service)}
                    >
                      Book This Service
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )

  function handleSelectService(service: ServiceWithProvider) {
    // Navigate to booking page with selected service
    // Store the selected service in localStorage for the booking process
    localStorage.setItem('selectedService', JSON.stringify(service));
    
    // Prepare provider info based on available data
    let providerInfo = '';
    
    // Prioritize business data when available
    if (service.business) {
      providerInfo = `\n\nBusiness: ${service.business.name}\nLocation: ${service.business.address}, ${service.business.city}\nPhone: ${service.business.phone}\nRating: ${service.business.rating || 0}/5 (${service.business.total_reviews || 0} reviews)`;
    }
    // Fall back to provider data if no business data
    else if (service.provider) {
      providerInfo = `\n\nProvider: ${service.provider.business_name}\nLocation: ${service.provider.business_address}, ${service.provider.city}\nPhone: ${service.provider.business_phone}\nRating: ${service.provider.rating || 0}/5 (${service.provider.total_reviews || 0} reviews)`;
    }
      
    alert(`Selected Service: ${service.name}\nPrice: ${formatPrice(parseFloat(service.base_price || '0'), 'USD')}\nDuration: ${service.duration_minutes} minutes${providerInfo}\n\nService stored for booking. You can now proceed to create a booking for this service.`);
    
    // TODO: Navigate to booking page
    // window.location.href = `/booking?serviceId=${service.id}`;
  }
}
