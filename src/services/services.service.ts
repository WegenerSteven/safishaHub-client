import apiService from './api';
import type { 
  Service, 
  ServiceCategory, 
  CreateServiceRequest, 
  UpdateServiceRequest, 
  ServiceFilterParams 
} from '@/interfaces';

export class ServicesService {
  /**
   * Get all services with optional filtering
   */
  async getAllServices(filters?: ServiceFilterParams): Promise<Service[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiService.get<Service[] | any>(`/services?${params.toString()}`);
      
      // Ensure we return an array even if the API returns an object with services property
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && response.services && Array.isArray(response.services)) {
        return response.services;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Services API did not return an array. Got:', response);
        return []; // Return empty array as fallback
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  }

  /**
   * Get a single service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    try {
      const response = await apiService.get<Service>(`/services/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new service
   */
  async createService(serviceData: CreateServiceRequest): Promise<Service> {
    try {
      const response = await apiService.post<CreateServiceRequest, Service>('/services', serviceData);
      return response;
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  }

  /**
   * Update an existing service
   */
  async updateService(id: string, serviceData: UpdateServiceRequest): Promise<Service> {
    try {
      const response = await apiService.patch<UpdateServiceRequest, Service>(`/services/${id}`, serviceData);
      return response;
    } catch (error) {
      console.error(`Failed to update service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(id: string): Promise<void> {
    try {
      await apiService.delete<void>(`/services/${id}`);
    } catch (error) {
      console.error(`Failed to delete service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all service categories
   */
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiService.get<ServiceCategory[]>('/services/categories');
      return response;
    } catch (error) {
      console.error('Failed to fetch service categories:', error);
      throw error;
    }
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    try {
      const response = await apiService.get<Service[]>(`/services/categories/${categoryId}/services`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch services for category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get services by provider
   */
  async getServicesByProvider(providerId: string): Promise<Service[]> {
    try {
      const response = await apiService.get<Service[]>(`/services/providers/${providerId}/services`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch services for provider ${providerId}:`, error);
      throw error;
    }
  }

  /**
   * Search services
   */
  async searchServices(query: string, filters?: ServiceFilterParams): Promise<Service[]> {
    try {
      const params = new URLSearchParams({ search: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiService.get<Service[]>(`/services/search?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to search services:', error);
      throw error;
    }
  }
}
