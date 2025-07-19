import api, { apiService } from './api';
import type { ServiceCategory } from '../interfaces/service/Service.interface';
// import type { Service } from '../interfaces/service/Service.interface';
// import type { ServicePricing } from '../interfaces/service/Service.interface';

// Updated service interface to match backend requirements
export interface Service {
  id?: string;
  business_id?: string;
  category_id: string;
  location_id?: string;
  name: string;
  description: string;
  short_description?: string;
  service_type: 'basic' | 'standard' | 'premium' | 'deluxe';
  vehicle_type: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'hatchback';
  base_price: number;
  duration_minutes: number;
  status?: 'active' | 'inactive' | 'draft';
  image_url?: string;
  is_available?: boolean;
}
//define api response types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
interface SingleServiceResponse extends ApiResponse<Service>{}
interface ServiceListResponse extends ApiResponse<Service[]>{}
interface CategoriesResponse extends ApiResponse<ServiceCategory[]>{}



export const serviceManagementService = {
  // Get all services for the provider
  async getProviderServices(): Promise<Service[]> {
    try {
      const response = await api.get<ApiResponse<ServiceListResponse>>('/services/provider');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching provider services:', error);
      return [];
    }
  },

  // Get service by ID
  async getServiceById(id: string): Promise<Service | null> {
    try {
      const response = await api.get<ApiResponse<SingleServiceResponse>>(`/services/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      return null;
    }
  },

  // Create a new service (supports FormData for image upload)
  async createService(serviceData: FormData | Partial<Service>): Promise<Service> {
    try {
      const response = await apiService.post<FormData | Partial<Service>, ApiResponse<SingleServiceResponse>>('/services', serviceData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      if (error?.response) {
        console.error('Backend error response:', error.response);
        throw new Error(`Error creating service: ${error.response.data.status}`);
      } else {
        console.error('Network Error creating service:', error);
        throw new Error('Network error. Please check your connection.');
      }
    }
  },

  // Helper methods to validate enum values
  validateServiceType(type: string): 'basic' | 'standard' | 'premium' | 'deluxe' {
    const validTypes = ['basic', 'standard', 'premium', 'deluxe'];
    return validTypes.includes(type.toLowerCase())
      ? type.toLowerCase() as 'basic' | 'standard' | 'premium' | 'deluxe'
      : 'standard';
  },

  validateVehicleType(type: string): 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'hatchback' {
    const validTypes = ['sedan', 'suv', 'truck', 'motorcycle', 'van', 'hatchback'];
    return validTypes.includes(type.toLowerCase())
      ? type.toLowerCase() as 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'hatchback'
      : 'sedan';
  },

  validateStatus(status: string): 'active' | 'inactive' | 'draft' {
    const validStatuses = ['active', 'inactive', 'draft'];
    return validStatuses.includes(status.toLowerCase())
      ? status.toLowerCase() as 'active' | 'inactive' | 'draft'
      : 'active';
  },

  // Update a service
  async updateService(id: string, serviceData: FormData | Partial<Service>): Promise<Service> {
    try {
      //handle formData
      if (serviceData instanceof FormData) {
        const response = await api.patch<FormData, ApiResponse<SingleServiceResponse>>(`/services/${id}`, serviceData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.data;
      } else {
        const response = await api.patch<Partial<Service>, ApiResponse<SingleServiceResponse>>(`/services/${id}`, serviceData);
        return response.data.data;
      }
    } catch (error: any) {
      if (error?.response) {
        console.error('Backend error response:', error.response.data);
        throw new Error(
          error.response.data.message || `Failed to update service: ${error.response.status}`
        );
      } else {
        console.error('Network error updating service:', error);
        throw new Error('Network error. Please check your connection.');
      }
    }
  },

  // Delete a service
  async deleteService(id: string): Promise<void> {
    try {
      await api.delete(`/services/${id}`);
    } catch (error: any) {
      if (error?.response) {
        console.error('Backend error response:', error.response.data);
        throw new Error(
          error.response.data.message || `Failed to delete service: ${error.response.status}`
        );
      } else {
        console.error('Network error deleting service:', error);
        throw new Error('Network error. Please check your connection.');
      }
    }
  },

  // Get all service categories
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await api.get<ServiceCategory[]>('/services/categories');

      // Handle different response structures
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      } else {
        console.warn('Unexpected categories response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
};
