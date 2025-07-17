import { apiService } from './api';
import type { Business } from '@/interfaces/business/Business.interface';
import type { Service } from '@/interfaces/service/Service.interface';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export class BusinessService {
  async getMyBusiness() {
    const response = await apiService.get<Business>('/businesses/my-business');
    return response;
  }

  async getBusinessById(id: string) {
    const response = await apiService.get<Business>(`/businesses/${id}`);
    return response;
  }

  async createBusiness(businessData: Partial<Business>): Promise<Business> {
    const response = await apiService.post<Partial<Business>, Business>('/businesses', businessData);
    return response;
  }

  async updateBusiness(id: string, businessData: Partial<Business>): Promise<Business> {
    const response = await apiService.patch<Partial<Business>, Business>(`/businesses/${id}`, businessData);
    return response;
  }

  async getBusinessServices(businessId: string) {
    const response = await apiService.get<Service[]>(`/businesses/${businessId}/services`);
    return response;
  }

  // TanStack Query Hooks
  useMyBusiness() {
    return useQuery({
      queryKey: ['my-business'],
      queryFn: () => this.getMyBusiness(),
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  useBusinessServices(businessId: string | undefined) {
    return useQuery({
      queryKey: ['business-services', businessId],
      queryFn: () => {
        if (!businessId) return Promise.resolve([]);
        return this.getBusinessServices(businessId);
      },
      enabled: !!businessId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  }

  useCreateBusiness() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: Partial<Business>) => this.createBusiness(data),
      onSuccess: (data) => {
        queryClient.setQueryData(['my-business'], data);
        toast.success('Business registered successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to register business');
      }
    });
  }

  useUpdateBusiness() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Business> }) =>
        this.updateBusiness(id, data),
      onSuccess: (data) => {
        queryClient.setQueryData(['my-business'], data);
        queryClient.invalidateQueries({ queryKey: ['business', data.id] });
        toast.success('Business updated successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update business');
      }
    });
  }
}

export const businessService = new BusinessService();
