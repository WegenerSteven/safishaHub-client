import { useQuery } from '@tanstack/react-query';
import { serviceManagementService } from '@/services/service-management.service';

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: () => serviceManagementService.getCategories(),
  });
}
