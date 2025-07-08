import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    // Redirect to dashboard if already authenticated
    const isAuthenticated =
      typeof window !== 'undefined' && localStorage.getItem('auth_token')
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { login, googleLogin, isLoading, clearError } = useAuth()

  const handleLogin = async (data: any) => {
    try {
      clearError()
      await login(data)

      // Redirect to dashboard - the dashboard component will handle the user type
      navigate({ to: '/dashboard' })
    } catch (error) {
      // Error is already handled by useAuth hook with toast notification
      console.error('Login error:', error)
    }
  }

  const handleGoogleLogin = () => {
    googleLogin()
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account or create a new one"
    >
      <LoginForm
        onSubmit={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
      />
    </AuthLayout>
  )
}
