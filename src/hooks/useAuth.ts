import { useEffect, useState } from 'react'
// import { toast } from 'sonner'
import type { LoginRequest, RegisterRequest, User } from '@/interfaces/auth/User.interface'
import { authService } from '@/services/auth.service'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  googleLogin: () => void
  error: string | null
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize user from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser)
    }
  }, [])

  const clearError = () => setError(null)

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authService.login(credentials)
      setUser(response.user)
      // toast.success('Login successful!', {
      //   description: 'Welcome back to SafishaHub!'
      // })
      console.log('Login successful! Welcome back to SafishaHub!')
    } catch (err: any) {
      let errorMessage = 'Login failed'
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password'
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found. Please check your email address.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      // toast.error('Login Failed', {
      //   description: errorMessage
      // })
      console.error('Login Failed:', errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authService.register(userData)
      setUser(response.user)
      // toast.success('Registration successful!', {
      //   description: 'Your account has been created. Welcome to SafishaHub!'
      // })
      console.log('Registration successful! Your account has been created. Welcome to SafishaHub!')
    } catch (err: any) {
      let errorMessage = 'Registration failed'
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        errorMessage = 'An account with this email already exists'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      // toast.error('Registration Failed', {
      //   description: errorMessage
      // })
      console.error('Registration Failed:', errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = () => {
    authService.googleLogin()
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login,
    register,
    logout,
    googleLogin,
    error,
    clearError,
  }
}
