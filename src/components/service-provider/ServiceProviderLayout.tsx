import { Outlet } from '@tanstack/react-router'
import { ServiceProviderNav } from './ServiceProviderNav'

export function ServiceProviderLayout() {
  return (
    <div className="flex min-h-screen">
      <ServiceProviderNav />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
