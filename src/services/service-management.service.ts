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

export interface Service {
  id?: string;
  provider_id: string;
  category_id: string;
  location_id?: string;
  name: string;
  description: string;
  service_type: 'mobile' | 'fixed' | 'both';
  vehicle_type: 'car' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'all';
  base_price: number;
  duration_minutes: number;
  featured: boolean;
  pricings?: ServicePricing[];
  status: 'active' | 'inactive' | 'pending';
  image_url?: string;
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
    const response = await api.post<Service, { data: Service }>('/services', serviceData);
    return response.data;
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
    const response = await api.get<{ data: ServiceCategory[] }>('/services/categories');
    return response.data;
  }
};
