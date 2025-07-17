import api from './api';
// import type { ServiceCategory } from '../interfaces/service/Service.interface';
// import type { Service } from '../interfaces/service/Service.interface';
// import type { ServicePricing } from '../interfaces/service/Service.interface';

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface ServicePricing {
  id?: string;
  service_id?: string;
  vehicle_type: string;
  price: number;
  duration_minutes: number;
}

// Updated service interface to match backend requirements
export interface Service {
  id?: string;
  business_id?: string; // Business ID will be set automatically
  category_id: string;
  location_id?: string;
  name: string;
  description: string;
  short_description?: string;
  service_type: 'basic' | 'standard' | 'premium' | 'deluxe';  // Updated to match backend enum
  vehicle_type: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'hatchback';  // Updated to match backend enum
  base_price: number;
  discounted_price?: number;
  duration_minutes: number;
  featured?: boolean;
  status?: 'active' | 'inactive' | 'draft';  // Updated to match backend enum
  features?: string[];
  requirements?: string[];
  images?: string[];
  image_url?: string;
  is_active?: boolean;
  is_available?: boolean;
  pricings?: ServicePricing[];
}

export const serviceManagementService = {
  // Get all services for the provider
  async getProviderServices(): Promise<Service[]> {
    const response = await api.get<{ data: Service[] }>('/services/provider');
    return response.data;
  },

  // Get service by ID
  async getServiceById(id: string): Promise<Service> {
    const response = await api.get<{ data: Service }>(`/services/${id}`);
    return response.data;
  },

  // Create a new service
  async createService(serviceData: Service): Promise<Service> {
    // Clean and validate the data before sending
    const cleanedData = {
      ...serviceData,
      // Ensure numeric values are numbers
      base_price: Number(serviceData.base_price),
      duration_minutes: Number(serviceData.duration_minutes),
      // Ensure we're using valid enum values
      service_type: this.validateServiceType(serviceData.service_type),
      vehicle_type: this.validateVehicleType(serviceData.vehicle_type),
      status: this.validateStatus(serviceData.status || 'active')
    };

    console.log('Creating service with data:', JSON.stringify(cleanedData, null, 2));

    try {
      const response = await api.post<Service, { data: Service }>('/services', cleanedData);
      console.log('Service created successfully:', response);
      return response.data;
    } catch (error: any) { // Type any for error to access response
      console.error('Error creating service:', error);
      if (error?.response) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
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
  async updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
    const response = await api.patch<Partial<Service>, { data: Service }>(`/services/${id}`, serviceData);
    return response.data;
  },

  // Delete a service
  async deleteService(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },

  // Get all service categories
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await api.get<any>('/services/categories');
      console.log('Categories API response:', response); // Add logging

      // Handle different response formats
      if (response && typeof response === 'object') {
        // Direct array response
        if (Array.isArray(response)) {
          return response;
        }

        // Response with data property containing array
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }

        // Response with nested data property
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }

        // Success property with data array
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
      }

      // If we can't determine the format
      console.warn('Unexpected categories response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return []; // Return empty array on error
    }
  }
};
