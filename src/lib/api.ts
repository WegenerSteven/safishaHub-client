// API configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// API client class
export class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Only access localStorage in browser
    this.initializeToken()
  }

  private initializeToken() {
    if (isBrowser) {
      try {
        this.token = localStorage.getItem('auth_token')
      } catch (error) {
        console.warn('Failed to access localStorage:', error)
        this.token = null
      }
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (isBrowser) {
      try {
        if (token) {
          localStorage.setItem('auth_token', token)
        } else {
          localStorage.removeItem('auth_token')
        }
      } catch (error) {
        console.warn('Failed to update localStorage:', error)
      }
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP error! status: ${response.status}`

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
    })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()
