import { apiService } from './api'
import type { User, LoginRequest, LoginResponse } from '../interfaces/auth/User.interface'
import type { RegisterRequest } from '../interfaces/auth/User.interface'
import type { AuthResponse } from '../interfaces/auth/AuthResponse.interface'


// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'


export class AuthService {

   async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.login(credentials) // Use the apiService login method    
    if (isBrowser) {
      localStorage.setItem('refresh_token', response.refreshToken)
    }
    return response
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.register(userData)
    return {
      user: response.user,
      accessToken: localStorage.getItem('auth_token') || '',
      refreshToken: localStorage.getItem('refresh_token') || '',
    }
  }

  /**
   * Initiate Google OAuth flow
   */
  async googleLogin(): Promise<void> {
    // Redirect to backend Google OAuth endpoint
    const googleAuthUrl = `${process.env.BASE_API_URL || 'http://localhost:3001/api'}/auth/google`
    window.location.href = googleAuthUrl
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await apiService.post<{ code: string }, LoginResponse>('/auth/google/callback',{ code },)

    // Store additional tokens
    if (isBrowser) {
      localStorage.setItem('refresh_token', response.refreshToken)
    }

    return {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiService.logout()
    if (isBrowser) {
      localStorage.removeItem('refresh_token')
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = isBrowser ? localStorage.getItem('refresh_token') : null
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    const response = await apiService.refreshToken()
    
    // Update stored user data if needed
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      return {
        user: currentUser,
        accessToken: response.accessToken,
        refreshToken: refreshToken, // Keep existing refresh token
      }
    }
    
    throw new Error('No current user found')
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    if (!isBrowser) return null

    const userJson = localStorage.getItem('user_data')
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
    return apiService.post<{ email: string }, { message: string }>('/auth/forgot-password', {
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
    return apiService.post<{ token: string; newPassword: string }, { message: string }>('/auth/reset-password', {
      token,
      newPassword,
    })
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiService.post<{ token: string }, { message: string }>('/auth/verify-email', { token })
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    return apiService.post<undefined, { message: string }>('/auth/resend-verification')
  }

  /**
   * Get current user profile from API
   */
  async getCurrentUserProfile(): Promise<User> {
    return apiService.getCurrentUser()
  }
}

// Create singleton instance
export const authService = new AuthService()
// Export types for convenience
export type { User}
