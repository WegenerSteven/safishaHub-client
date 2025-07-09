import api from './api';
import type { ApiResponse } from '../interfaces/api.interface';
import type {
  ProfileResponse,
  UserProfile,
  CustomerProfile,
  ServiceProviderProfile,
} from '../interfaces/profile/profile.interface';
import type { DashboardData } from '../interfaces/dashboard/dashboard.interface';

export const profileService = {
  // Get user profile
  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get<ApiResponse<ProfileResponse>>('/users/profile');
    return response.data;
  },

  // Update user basic profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put<Partial<UserProfile>, ApiResponse<UserProfile>>('/users/profile', data);
    return response.data;
  },

  // Update customer profile
  async updateCustomerProfile(data: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const response = await api.put<Partial<CustomerProfile>, ApiResponse<CustomerProfile>>('/users/profile/customer', data);
    return response.data;
  },

  // Update service provider profile
  async updateServiceProviderProfile(data: Partial<ServiceProviderProfile>): Promise<ServiceProviderProfile> {
    const response = await api.put<Partial<ServiceProviderProfile>, ApiResponse<ServiceProviderProfile>>('/users/profile/service-provider', data);
    return response.data;
  },

  // Get dashboard data
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get<ApiResponse<DashboardData>>('/users/dashboard');
    return response.data;
  },

  // Verify email
  async verifyEmail(): Promise<UserProfile> {
    const response = await api.post<null, ApiResponse<UserProfile>>('/users/verify-email');
    return response.data;
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post<FormData, ApiResponse<{ avatar: string }>>('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
