import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '@/services/api';

// Define API response types
export interface AuthResponse {
  accessToken: string; // Changed from access_token to match API response
  refreshToken?: string;
  user?: User;
  [key: string]: any;
}

// Define the user type
interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  role?: string;
  is_service_provider?: boolean;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isServiceProvider: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  error: string | null;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch user profile using the API service method
        try {
          const userData = await apiService.getCurrentUser();
          // If we get here, the user data is valid
          setUser(userData);
        } catch (error) {
          console.error('Invalid user data format received:', error);
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Clear invalid token
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      // Use the apiService.login method instead of directly calling post
      const response = await apiService.login({ email, password });

      // Process the response from the login service
      const authResponse = response as AuthResponse;
      if (authResponse && 'accessToken' in authResponse) {
        // Response structure from apiService.login already handles token storage

        // Set user from the response
        if (response.user && typeof response.user === 'object' && 'id' in response.user && 'email' in response.user) {
          setUser(response.user as User);
          // Dispatch auth change event to close modals
          window.dispatchEvent(new CustomEvent('auth-change'));
        } else {
          throw new Error('Invalid user data format received');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);

      // Use the apiService.logout method
      try {
        await apiService.logout();
        // No need to manually clear token as apiService.logout already does this
      } catch (err) {
        console.warn('Logout API call failed, proceeding with client-side logout');
        // Fallback: clear token manually if the API call fails
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }

      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout properly');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: any): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      // Use apiService.register method which handles token storage
      const response = await apiService.register(userData);

      // User data is already set in localStorage by apiService.register
      if (response && response.user) {
        setUser(response.user as User);

        // No need to fetch profile separately as it's included in the response

        // Dispatch auth change event to close modals
        window.dispatchEvent(new CustomEvent('auth-change'));
      } else {
        console.error('Invalid response format during registration:', response);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      // Update user profile
      const updatedUser = await apiService.patch('/users/profile', profileData);

      // Type check and merge only if we have a valid object
      if (updatedUser && typeof updatedUser === 'object') {
        setUser(prevUser => {
          if (prevUser === null) return updatedUser as User;
          return { ...prevUser, ...(updatedUser as Partial<User>) };
        });
      } else {
        console.error('Invalid profile update data:', updatedUser);
      }
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is a service provider
  const isServiceProvider = !!user && (user.role === 'service_provider' || user.is_service_provider === true);

  // Create context value
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isServiceProvider,
    loading,
    login,
    logout,
    register,
    updateProfile,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
