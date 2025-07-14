import { Link, useMatch, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Settings,
  LogOut,
  User,
  Car,
  BarChart3,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { authService } from '@/services'

interface NavLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick?: () => void
}

export function ServiceProviderNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate({ to: '/login' })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="rounded-full"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`lg:hidden fixed top-0 left-0 right-0 bottom-0 bg-background z-40 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pt-16">
          <div className="space-y-4">
            <NavLinks onNavClick={() => setIsMobileMenuOpen(false)} />
            <hr className="my-4" />
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Side Navigation */}
      <div className="hidden lg:flex flex-col h-screen w-64 border-r bg-muted/20">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">SafishaHub</h2>
          <p className="text-xs text-muted-foreground">Service Provider Portal</p>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <NavLinks />
        </div>
        <div className="p-4 border-t mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}

function NavLinks({ onNavClick }: { onNavClick?: () => void } = {}) {
  const dashboardMatch = !!useMatch({ to: '/service-provider-dashboard' })
  const servicesMatch = !!useMatch({ to: '/service-provider/services' }) 
  const bookingsMatch = !!useMatch({ to: '/dashboard/provider-bookings' })
  const schedulingMatch = !!useMatch({ to: '/service-provider/availability' })
  const analyticsMatch = !!useMatch({ to: '/service-provider/analytics' })
  const profileMatch = !!useMatch({ to: '/service-provider/profile' })
  const settingsMatch = !!useMatch({ to: '/service-provider/settings' })
  
  return (
    <nav className="space-y-1">
      <NavLink 
        to="/service-provider-dashboard" 
        icon={<LayoutDashboard className="h-5 w-5" />}
        label="Dashboard"
        isActive={dashboardMatch}
        onClick={onNavClick}
      />
      <NavLink 
        to="/service-provider/services" 
        icon={<Car className="h-5 w-5" />}
        label="Services"
        isActive={servicesMatch}
        onClick={onNavClick}
      />
      <NavLink 
        to="/dashboard/provider-bookings" 
        icon={<ClipboardList className="h-5 w-5" />}
        label="Bookings"
        isActive={bookingsMatch}
        onClick={onNavClick}
      />
      <NavLink 
        to="/service-provider/availability" 
        icon={<Calendar className="h-5 w-5" />}
        label="Availability"
        isActive={schedulingMatch}
        onClick={onNavClick}
      />
      <NavLink 
        to="/service-provider/analytics" 
        icon={<BarChart3 className="h-5 w-5" />}
        label="Analytics"
        isActive={analyticsMatch}
        onClick={onNavClick}
      />
      <NavLink 
        to="/service-provider/profile" 
        icon={<User className="h-5 w-5" />}
        label="Profile"
        isActive={profileMatch}
        onClick={onNavClick}
      />
      <NavLink 
        to="/service-provider/settings" 
        icon={<Settings className="h-5 w-5" />}
        label="Settings"
        isActive={settingsMatch}
        onClick={onNavClick}
      />
    </nav>
  )
}

function NavLink({ to, icon, label, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      activeProps={{
        className: 'bg-muted font-medium text-primary'
      }}
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-muted font-medium text-primary' 
          : 'hover:bg-muted/50'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  )
}
