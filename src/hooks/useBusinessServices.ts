import { useQuery } from '@tanstack/react-query';
import { businessService } from '../services/business.service';

export function useBusiness() {
  return useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessService.getMyBusiness(),
    retry: 1,
  });
}

export function useBusinessServices(businessId?: string) {
  return useQuery({
    queryKey: ['business-services', businessId],
    queryFn: () => businessId ? businessService.getBusinessServices(businessId) : Promise.resolve([]),
    enabled: !!businessId,
  });
}
