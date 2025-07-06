import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/register')({
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
  const { register, googleLogin, isLoading, error, clearError } = useAuth()

  const handleRegister = async (data: any) => {
    try {
      clearError()
      await register(data)

      // Redirect to dashboard - the dashboard component will handle the user type
      navigate({ to: '/dashboard' })
      console.log('Account created successfully! Welcome to SafishaHub!')
    } catch (error) {
      console.error('Registration error:', error)
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
      <RegisterForm
        onSubmit={handleRegister}
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
