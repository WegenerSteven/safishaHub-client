import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    // Redirect to dashboard if already authenticated
    const isAuthenticated =
      typeof window !== 'undefined' && localStorage.getItem('auth_token')
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
    
    // Redirect to home page where user can access register modal
    throw redirect({ 
      to: '/',
      search: { openRegister: true }
    })
  },
})
