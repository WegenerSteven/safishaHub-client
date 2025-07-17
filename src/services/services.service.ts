import { apiService } from './api';
import type { Service, ServiceCategory } from '@/interfaces/service/Service.interface';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ServiceFilterParams = {
  category_id?: string;
  business_id?: string;
  location_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export class ServicesService {
  /**
   * Get services with optional filtering
   */
  async getServices(filters?: ServiceFilterParams): Promise<Service[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await apiService.get<Service[]>(`/services?${params.toString()}`);
    return response;
  }

  /**
   * Get a service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    const response = await apiService.get<Service>(`/services/${id}`);
    return response;
  }

  /**
   * Create a new service
   */
  async createService(serviceData: Partial<Service>): Promise<Service> {
    const response = await apiService.post<Partial<Service>, Service>('/services', serviceData);
    return response;
  }

  /**
   * Update an existing service
   */
  async updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
    const response = await apiService.put<Partial<Service>, Service>(`/services/${id}`, serviceData);
    return response;
  }

  /**
   * Delete a service
   */
  async deleteService(id: string): Promise<void> {
    await apiService.delete(`/services/${id}`);
  }

  /**
   * Get all service categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    const response = await apiService.get<ServiceCategory[]>('/services/categories');
    return response;
  }

  /**
   * Get services by business
   */
  async getServicesByBusiness(businessId: string): Promise<Service[]> {
    const response = await apiService.get<Service[]>(`/businesses/${businessId}/services`);
    return response;
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

  /**
   * TanStack Query Hooks
   */

  useServiceCategories() {
    return useQuery({
      queryKey: ['service-categories'],
      queryFn: () => this.getCategories(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  }

  useServices(filters?: ServiceFilterParams) {
    return useQuery({
      queryKey: ['services', filters],
      queryFn: () => this.getServices(filters),
    });
  }

  useServiceById(id: string | undefined) {
    return useQuery({
      queryKey: ['service', id],
      queryFn: () => {
        if (!id) return Promise.reject('No service ID provided');
        return this.getServiceById(id);
      },
      enabled: !!id,
    });
  }

  useCreateService() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: Partial<Service>) => this.createService(data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
        queryClient.invalidateQueries({ queryKey: ['business-services', data.business_id] });
        toast.success('Service created successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create service');
      }
    });
  }

  useUpdateService() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
        this.updateService(id, data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
        queryClient.invalidateQueries({ queryKey: ['service', data.id] });
        queryClient.invalidateQueries({ queryKey: ['business-services', data.business_id] });
        toast.success('Service updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update service');
      }
    });
  }

  useDeleteService() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => this.deleteService(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
        queryClient.invalidateQueries({ queryKey: ['business-services'] });
        toast.success('Service deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete service');
      }
    });
  }
}
