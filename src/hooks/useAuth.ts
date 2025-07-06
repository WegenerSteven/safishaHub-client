import { useEffect, useState } from 'react'
import type {LoginRequest, RegisterRequest, User} from '@/services/auth.service';
import {
  
  
  
  authService
} from '@/services/auth.service'

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
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
