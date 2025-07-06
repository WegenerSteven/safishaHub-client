import { createFileRoute } from '@tanstack/react-router'
import { Users, Shield, Sparkles, Clock } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About SafishaHub
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting you with trusted car wash professionals across Kenya. 
              "Safisha" means "to clean" in Swahili, reflecting our African roots.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 mb-4 text-lg">
                SafishaHub was founded with a simple mission: to make professional
                car care accessible and convenient for everyone in Kenya. We
                recognized the need for a reliable platform that connects car
                owners with trusted, professional car wash service providers.
              </p>
              <p className="text-gray-600 mb-4 text-lg">
                Starting in Nairobi, we've grown to serve customers across major
                cities, building a network of vetted professionals who share our
                commitment to quality and customer satisfaction.
              </p>
              <p className="text-gray-600 text-lg">
                Today, SafishaHub is Kenya's leading car wash service platform,
                trusted by thousands of customers and hundreds of service
                providers.
              </p>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop"
                alt="Car wash service"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Why Choose SafishaHub?
            </h2>
            <p className="text-xl text-gray-600">
              We're committed to providing the best car care experience in Kenya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Eco-Friendly</h4>
              <p className="text-gray-600">
                Environmentally safe products and water-efficient processes
              </p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Trusted Professionals
              </h4>
              <p className="text-gray-600">
                Vetted and trained service providers you can trust
              </p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Flexible Scheduling
              </h4>
              <p className="text-gray-600">
                Book anytime that works for you, 7 days a week
              </p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Quality Guaranteed
              </h4>
              <p className="text-gray-600">
                100% satisfaction guarantee on every service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Join Our Community
            </h2>
            <p className="text-xl text-gray-600">
              Thousands of satisfied customers trust SafishaHub for their car care needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Service Providers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <p className="text-gray-600">Cars Washed</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
