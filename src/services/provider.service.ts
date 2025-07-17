import type { DashboardData } from '@/interfaces/dashboard/dashboard.interface';
import { apiService } from './api';

class ProviderDashboardService {
  async getDashboardStats(): Promise<DashboardData> {
    return await apiService.get<DashboardData>('/service-provider-dashboard/stats');
  }

  async getBookingNotifications(): Promise<any[]>{
    return await apiService.get<any[]>('/service-provider-dashboard/notifications');
  }

  async getProviderBookings(filters?:{
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<any>{
    let queryParams = '';

    if(filters){
      const params = new URLSearchParams();
      if(filters.status) params.append('status', filters.status);
      if(filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if(filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if(filters.page) params.append('page', filters.page.toString());
      if(filters.limit) params.append('limit', filters.limit.toString());
      queryParams = `?${params.toString()}`;
    }

    return await apiService.get<any[]>(`/service-provider-dashboard/bookings${queryParams}`);
  }

  async acceptBooking(bookingId: string): Promise<any> {
    return await apiService.post(`/service-provider-dashboard/bookings/${bookingId}/accept`, {});
  }
}

export const ServiceProviderDashboardService = new ProviderDashboardService();
