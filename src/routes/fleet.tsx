import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/fleet')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-8">
            Fleet Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-muted-foreground mb-12">
            Professional car wash services for your entire fleet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Fleet Benefits */}
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Why Choose Our Fleet Services?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white dark:text-primary-foreground text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-foreground">
                    Volume Discounts
                  </h3>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    Save up to 30% on bulk vehicle washing services
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Scheduled Service
                  </h3>
                  <p className="text-gray-600">
                    Regular maintenance schedules to keep your fleet pristine
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    On-Site Service
                  </h3>
                  <p className="text-gray-600">
                    We come to your location for maximum convenience
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Detailed Reporting
                  </h3>
                  <p className="text-gray-600">
                    Track service history and maintain records
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Get Fleet Quote
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fleet Size
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select fleet size</option>
                  <option>5-10 vehicles</option>
                  <option>11-25 vehicles</option>
                  <option>26-50 vehicles</option>
                  <option>50+ vehicles</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Frequency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select frequency</option>
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Requirements
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Tell us about your specific needs..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Fleet Quote
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
