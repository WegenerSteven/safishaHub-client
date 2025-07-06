import { apiClient } from '@/lib/api'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'service_provider' | 'admin'
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  accountType: 'customer' | 'service_provider'
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface GoogleAuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private isDevMode =
    import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development'

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    if (this.isDevMode) {
      // Mock authentication for development
      return this.mockLogin(credentials)
    }

    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials,
    )

    // Store tokens
    apiClient.setToken(response.accessToken)
    if (isBrowser) {
      localStorage.setItem('auth_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
    }

    return response
  }

  private async mockLogin(credentials: LoginRequest): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user data - determine role based on email
    const isServiceProvider =
      credentials.email.includes('provider') ||
      credentials.email.includes('driver')

    const mockUser: User = {
      id: '1',
      email: credentials.email,
      firstName: isServiceProvider ? 'John' : 'Jane',
      lastName: isServiceProvider ? 'Driver' : 'Customer',
      role: isServiceProvider ? 'service_provider' : 'customer',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mockResponse: AuthResponse = {
      user: mockUser,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    }

    // Store tokens
    apiClient.setToken(mockResponse.accessToken)
    if (isBrowser) {
      localStorage.setItem('auth_token', mockResponse.accessToken)
      localStorage.setItem('refresh_token', mockResponse.refreshToken)
      localStorage.setItem('user', JSON.stringify(mockResponse.user))
    }

    return mockResponse
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    if (this.isDevMode) {
      // Mock authentication for development
      return this.mockRegister(userData)
    }

    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      userData,
    )

    // Store tokens
    apiClient.setToken(response.accessToken)
    if (isBrowser) {
      localStorage.setItem('auth_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
    }

    return response
  }

  private async mockRegister(userData: RegisterRequest): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role:
        userData.accountType === 'service_provider'
          ? 'service_provider'
          : 'customer',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mockResponse: AuthResponse = {
      user: mockUser,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    }

    // Store tokens
    apiClient.setToken(mockResponse.accessToken)
    if (isBrowser) {
      localStorage.setItem('auth_token', mockResponse.accessToken)
      localStorage.setItem('refresh_token', mockResponse.refreshToken)
      localStorage.setItem('user', JSON.stringify(mockResponse.user))
    }

    return mockResponse
  }

  /**
   * Initiate Google OAuth flow
   */
  async googleLogin(): Promise<void> {
    // Redirect to backend Google OAuth endpoint
    const googleAuthUrl = `${(apiClient as any).baseURL}/auth/google`
    window.location.href = googleAuthUrl
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/google/callback',
      { code },
    )

    // Store tokens
    apiClient.setToken(response.accessToken)
    if (isBrowser) {
      localStorage.setItem('auth_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
    }

    return response
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      // Clear all stored data
      apiClient.setToken(null)
      if (isBrowser) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      }
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = isBrowser
      ? localStorage.getItem('refresh_token')
      : null
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })

    // Update tokens
    apiClient.setToken(response.accessToken)
    if (isBrowser) {
      localStorage.setItem('auth_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
    }

    return response
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    if (!isBrowser) return null

    const userJson = localStorage.getItem('user')
    if (!userJson) return null

    try {
      return JSON.parse(userJson) as User
    } catch {
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!isBrowser) return false
    return !!localStorage.getItem('auth_token') && !!this.getCurrentUser()
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    if (!isBrowser) return null
    return localStorage.getItem('auth_token')
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', {
      email,
    })
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    })
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/verify-email', { token })
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/resend-verification')
  }
}

// Create singleton instance
export const authService = new AuthService()
