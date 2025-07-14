import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import type { ApiResponse } from '../interfaces/api.interface';
import type { LoginRequest, LoginResponse, User } from '../interfaces/auth/User.interface';
import type { RegisterRequest } from '../interfaces/auth/User.interface';
import type { AuthResponse } from '../interfaces/auth/AuthResponse.interface';

class ApiService {
    private api: AxiosInstance;
    private baseURL: string;

    constructor() {
        // This baseURL already includes the /api prefix
        this.baseURL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:3001/api';

        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 10000, // 10 seconds timeout
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        //request interceptor to add authentication token
        this.api.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        //response interceptor to handle errors
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error) => {
                // Enhance error with response data
                if (error.response) {
                    error.response.data = error.response.data || {};
                }

                if (error.response?.status === 401) {
                    this.clearToken();
                    // Only redirect if not already on login/register page
                    if (!window.location.pathname.includes('/login') &&
                        !window.location.pathname.includes('/register')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    };

    //token management
    private getToken(): string | null {
        // Check both 'auth_token' and 'token' in localStorage (different naming conventions)
        return localStorage.getItem('auth_token') || localStorage.getItem('token') || null;
    }

    private setToken(token: string): void {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token); // Set both for compatibility
    }

    private clearToken(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
    }

    //generic http methods
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.get<T>(url, config);
        return response.data;
    }

    async post<TRequest, TResponse>(url: string, data?: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
        const response = await this.api.post<TResponse>(url, data, config);
        return response.data;
    }

    async put<TRequest, TResponse>(url: string, data?: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
        const response = await this.api.put<TResponse>(url, data, config);
        return response.data;
    }
    async patch<TRequest, TResponse>(url: string, data?: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
        const response = await this.api.patch<TResponse>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.delete<T>(url, config);
        return response.data;
    }

    //Auth methods
    async login(data: LoginRequest): Promise<LoginResponse> {
        // Use the correct endpoint with /api prefix
        const response = await this.post<LoginRequest, any>('/auth/signin', data);

        // Handle the backend response structure: { user, tokens, message }
        if (response.tokens?.accessToken) {
            this.setToken(response.tokens.accessToken);
            localStorage.setItem('user_data', JSON.stringify(response.user));
        }

        return {
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
            user: response.user
        };
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        console.log('API.register called with userData:', userData);
        let endpoint: string;

        // Use role-specific registration endpoints that match the backend
        if (userData.role === 'customer') {
            endpoint = '/auth/signup'; // Use signup for customers
        } else if (userData.role === 'service_provider') {
            endpoint = '/auth/register/service-provider'; // Use specific service provider endpoint
        } else {
            throw new Error('Invalid role specified');
        }

        // Transform the frontend data to match backend DTOs
        const backendData = {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: userData.password,
            ...(userData.phone && { phone: userData.phone }),
        };

        console.log('API.register - Final endpoint:', endpoint);
        console.log('API.register - Final backendData:', backendData);
        const response = await this.post<typeof backendData, any>(endpoint, backendData);

        // Handle the backend response structure: { user, accessToken, refreshToken, message }
        if (response.accessToken) {
            this.setToken(response.accessToken);
            localStorage.setItem('user_data', JSON.stringify(response.user));
            localStorage.setItem('refresh_token', response.refreshToken);
        }

        return {
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        };
    }

    async logout(): Promise<void> {
        try {
            await this.post<undefined, void>('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
        }
    }

    async getCurrentUser(): Promise<User> {
        return await this.get<User>('/auth/profile');
    }

    async refreshToken(): Promise<{ accessToken: string }> {
        const response = await this.post<undefined, { accessToken: string }>('/auth/refresh');
        this.setToken(response.accessToken);
        return response;
    }

    async healthcheck(): Promise<ApiResponse<string>> {
        return await this.get<ApiResponse<string>>('/cors-test')
    }
}

export const apiService = new ApiService();
export default apiService;