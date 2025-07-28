import api, { apiService } from './api';
import type { AxiosResponse } from 'axios';
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


export const serviceManagementService = {
  // Get all services for the provider
  async getProviderServices(): Promise<Service[]> {
    try {
      const response: AxiosResponse<ApiResponse<Service[]>> = await api.get('/services/provider');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching provider services:', error);
      return [];
    }
  },

  // Get service by ID
  async getServiceById(id: string): Promise<Service | null> {
    try {
      const response: AxiosResponse<ApiResponse<Service>> = await api.get(`/services/${id}`);
      if (response.data && typeof response.data.data === 'object' && 'category_id' in response.data.data) {
        return response.data.data as Service;
      }
      if (response.data && 'data' in response.data && typeof (response.data as any).data === 'object') {
        return (response.data as any).data as Service;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      return null;
    }
  },

  // Create a new service (supports FormData for image upload)
  async createService(serviceData: FormData | Partial<Service>): Promise<Service> {
    try {
      const response: AxiosResponse<ApiResponse<Service>> = await apiService.post('/services', serviceData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && typeof response.data.data === 'object' && 'category_id' in response.data.data) {
        return response.data.data as Service;
      }
      if (response.data && 'data' in response.data && typeof (response.data as any).data === 'object') {
        return (response.data as any).data as Service;
      }
      throw new Error(response.data?.message || 'Failed to create service');
    } catch (error: any) {
      if (error?.response) {
        const msg = error.response.data?.message || error.response.data?.status || 'Backend error';
        console.error('Backend error response:', error.response);
        throw new Error(`Error creating service: ${msg}`);
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
      let response: AxiosResponse<any>;
      if (serviceData instanceof FormData) {
        response = await api.patch(`/services/${id}`, serviceData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.patch(`/services/${id}`, serviceData);
      }
      // Log the full response for diagnosis
      console.log('updateService response:', response);
      // Accept direct service object
      if (response.data && typeof response.data === 'object' && 'id' in response.data && 'name' in response.data) {
        return response.data as Service;
      }
      // Accept wrapped service object
      if (response.data && typeof response.data.data === 'object' && response.data.data !== null) {
        return response.data.data as Service;
      }
      // Accept nested data (sometimes backend double-wraps)
      if (response.data && response.data.data && typeof response.data.data.data === 'object') {
        return response.data.data.data as Service;
      }
      // Accept if response.data is not null and has expected keys
      if (response.data && typeof response.data === 'object' && 'category_id' in response.data) {
        return response.data as Service;
      }
      // Accept success message only (no service object)
      if (response.data && (response.data.success === true || response.data.message)) {
        // Return a minimal Service object or null if needed
        return { id, ...serviceData } as Service;
      }
      // Log unexpected response
      console.error('Unexpected updateService response format:', response.data);
      throw new Error(response.data?.message || 'Failed to update service: Unexpected response format');
    } catch (error: any) {
      if (error?.response) {
        console.error('Backend error response:', error.response.data);
        throw new Error(
          error.response.data.message || `Failed to update service: ${error.response.status}`
        );
      } else if (error instanceof Error) {
        console.error('Network or unknown error updating service:', error.message);
        throw new Error(error.message || 'Network error. Please check your connection.');
      } else {
        console.error('Unknown error updating service:', error);
        throw new Error('Unknown error occurred while updating service.');
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
      const response: AxiosResponse<any> = await api.get('/services/categories');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (response.data && Array.isArray(response.data.categories)) {
        return response.data.categories;
      }
      console.warn('Unexpected categories response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch service categories');
    }
  },
};
