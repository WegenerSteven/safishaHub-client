import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceManagementService } from '../services/service-management.service';
import { toast } from 'sonner';

export function useCreateServiceMutation(businessId?: string, imageFile?: File | null, resetForm?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (imageFile && !(data instanceof FormData)) {
        const formData = new FormData();
        formData.append('image', imageFile);
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value != null ? value.toString() : '');
        });
        return serviceManagementService.createService(formData as any);
      } else {
        return serviceManagementService.createService(data as any);
      }
    },
    onSuccess: () => {
      toast.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: ['business-services', businessId] });
      resetForm && resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create service');
      console.error('Error creating service:', error.response?.data);
    },
  });
}

export function useUpdateServiceMutation(businessId?: string, currentServiceId?: string, resetForm?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      if (!currentServiceId) throw new Error('No service ID to update');
      return serviceManagementService.updateService(currentServiceId, {
        ...data,
        business_id: businessId,
      });
    },
    onSuccess: () => {
      toast.success('Service updated successfully');
      queryClient.invalidateQueries({ queryKey: ['business-services', businessId] });
      resetForm && resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update service');
    },
  });
}

export function useDeleteServiceMutation(businessId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => serviceManagementService.deleteService(serviceId),
    onSuccess: () => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['business-services', businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    },
  });
}
