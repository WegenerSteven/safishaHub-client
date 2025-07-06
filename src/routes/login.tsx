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
  const { login, googleLogin, isLoading, error, clearError } = useAuth()

  const handleLogin = async (data: any) => {
    try {
      clearError()
      await login(data)

      // Redirect to dashboard - the dashboard component will handle the user type
      navigate({ to: '/dashboard' })
      console.log('Login successful!')
    } catch (error) {
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
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </AuthLayout>
  )
}
