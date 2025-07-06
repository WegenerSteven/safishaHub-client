import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Car, LogOut, MapPin, Menu, Phone, User, X } from 'lucide-react'
import { Button } from './ui/button'
import { AuthModal } from './auth/AuthModal'
import type {User as AuthUser} from '@/services/auth.service';
import {  authService } from '@/services/auth.service'
import { useModal } from '@/contexts/ModalContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const {
    openAuth,
    openLogin,
    openRegister
  } = useModal()

  // Check authentication status
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  useEffect(() => {
    // Listen for auth changes
    const handleAuthChange = () => {
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
    }

    window.addEventListener('auth-change', handleAuthChange)
    return () => window.removeEventListener('auth-change', handleAuthChange)
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with contact info */}
        <div className="hidden sm:flex items-center justify-between py-2 text-sm text-gray-600 border-b border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>1-800-SAFISHA</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Nationwide Service</span>
            </div>
          </div>
          <div className="text-blue-600 font-medium">
            Open 24/7 for your convenience
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="font-bold text-xl text-gray-900">
              Safisha<span className="text-blue-600">Hub</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Services
            </Link>
            <Link
              to="/fleet"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Fleet Services
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Contact
            </Link>
          </nav>

          {/* Auth buttons and mobile menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span>Hello, {user.firstName}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openLogin}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={openRegister}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/services"
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/fleet"
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Fleet Services
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                {user ? (
                  <>
                    <div className="text-sm text-gray-700 py-2">
                      Hello, {user.firstName}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        openLogin()
                        setIsMenuOpen(false)
                      }}
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        openRegister()
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal />
    </header>
  )
}
