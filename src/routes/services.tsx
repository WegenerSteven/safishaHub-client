import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle, Clock, Crown, Droplets, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import type { Service } from '@/interfaces'
import { ServiceType, ServiceStatus } from '@/interfaces'
import { servicesService } from '@/services'

export const Route = createFileRoute('/services')({
  component: RouteComponent,
})

function RouteComponent() {
  const [services, setServices] = useState<Service[]>([])
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
      
      // Load services and categories in parallel
      const servicesData = await servicesService.getAllServices({ is_available: true, status: ServiceStatus.ACTIVE })
      console.log('Services data received:', servicesData)
      
      // Ensure we have an array of services
      if (servicesData && Array.isArray(servicesData)) {
        setServices(servicesData)
      } else {
        console.error('Services data is not an array:', servicesData)
        setError('Invalid data format received from server.')
        // Fallback to mock data for development
        setServices(getMockServices())
      }
    } catch (err) {
      console.error('Failed to load services data:', err)
      setError('Failed to load services. Please try again later.')
      // Fallback to mock data for development
      setServices(getMockServices())
      // setCategories(getMockCategories())
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
                    
                    <div className="text-4xl font-bold text-blue-600 mb-4">
                      {formatPrice(service.price, service.currency)}
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
                      Select Package
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

  function handleSelectService(service: Service) {
    // Navigate to booking page with selected service
    // This would typically use React Router navigation
    console.log('Selected service:', service)
    // For now, we'll just log it. Later we can add navigation to booking page
    alert(`Selected ${service.name} - ${formatPrice(service.price, service.currency)}`)
  }

  // Mock data functions for fallback
  function getMockServices(): Service[] {
    return [
      {
        id: '1',
        provider_id: 'provider-1',
        category_id: 'cat-1',
        name: 'Basic Wash',
        description: 'Essential car wash for everyday cleanliness',
        price: 15,
        currency: 'USD',
        duration_minutes: 20,
        service_type: ServiceType.BASIC,
        vehicle_types: ['sedan', 'suv', 'hatchback'] as any,
        status: 'active' as any,
        is_available: true,
        features: ['Exterior wash', 'Tire cleaning', 'Basic interior vacuum'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        provider_id: 'provider-1',
        category_id: 'cat-1',
        name: 'Premium Wash',
        description: 'Complete car wash with interior detailing',
        price: 35,
        currency: 'USD',
        duration_minutes: 45,
        service_type: ServiceType.PREMIUM,
        vehicle_types: ['sedan', 'suv', 'hatchback'] as any,
        status: 'active' as any,
        is_available: true,
        features: ['Everything in Basic', 'Interior detailing', 'Wax coating', 'Dashboard cleaning'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        provider_id: 'provider-1',
        category_id: 'cat-1',
        name: 'Deluxe Detailing',
        description: 'Professional detailing service with premium care',
        price: 65,
        currency: 'USD',
        duration_minutes: 90,
        service_type: ServiceType.DELUXE,
        vehicle_types: ['sedan', 'suv', 'hatchback'] as any,
        status: 'active' as any,
        is_available: true,
        features: ['Everything in Premium', 'Leather conditioning', 'Engine bay cleaning', 'Tire shine'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  }

  // getMockCategories removed (unused)
}
