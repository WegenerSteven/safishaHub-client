import apiService from './api';
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
    const response = await apiService.get<ApiResponse<ProfileResponse>>('/auth/profile');
    return response.data;
  },

  // Update user profile (unified for all roles)
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try{
    const response = await apiService.put<Partial<UserProfile>, ApiResponse<UserProfile>>('/users/profile', data);
    return response.data;
    } catch(error){
      console.log('error updating the profile', error);
      throw new Error('Failed to update profile');
    }
    
  },

  // Update customer specific fields
  async updateCustomerProfile(data: Partial<CustomerProfile>): Promise<CustomerProfile> {
    // Since we now have a unified users table, use the users endpoint
    const response = await apiService.put<Partial<CustomerProfile>, ApiResponse<CustomerProfile>>('/users/profile', data);
    return response.data;
  },

  // Update service provider specific fields
  async updateServiceProviderProfile(data: Partial<ServiceProviderProfile>): Promise<ServiceProviderProfile> {
    // Since we now have a unified users table, use the users endpoint
    const response = await apiService.put<Partial<ServiceProviderProfile>, ApiResponse<ServiceProviderProfile>>('/users/profile', data);
    return response.data;
  },

  // Get service provider dashboard data
  async getServiceProviderDashboard(): Promise<DashboardData> {
    const response = await apiService.get<ApiResponse<DashboardData>>('/users/service-provider/dashboard');
    return response.data;
  },

  // Get general dashboard data
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiService.get<ApiResponse<DashboardData>>('/users/dashboard');
    return response.data;
  },

  // Verify email
  async verifyEmail(): Promise<UserProfile> {
    const response = await apiService.post<null, ApiResponse<UserProfile>>('/users/verify-email');
    return response.data;
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiService.post<FormData, ApiResponse<{ avatar: string }>>('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
