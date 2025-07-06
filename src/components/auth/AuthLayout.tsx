import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Car } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center space-x-2 mb-8"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
            <Car className="h-7 w-7 text-white" />
          </div>
          <div className="font-bold text-2xl text-gray-900">
            Safisha<span className="text-blue-600">Hub</span>
          </div>
        </Link>

        {/* Title and Subtitle */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      {/* Terms and Privacy */}
      <div className="mt-8 text-center text-sm text-gray-600">
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:text-blue-700">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-blue-600 hover:text-blue-700">
          Privacy Policy
        </a>
      </div>
    </div>
  )
}
