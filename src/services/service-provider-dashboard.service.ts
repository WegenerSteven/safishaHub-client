import { apiService } from './api';
import type { Booking } from '@/interfaces/booking/Booking.interface';
import { BookingStatus } from '@/interfaces';

export interface ServiceProviderDashboardStats {
  totalBookings: number;
  totalServices: number;
  activeServices: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  businessStatus: 'active' | 'pending' | 'inactive';
  rating: number;
  recentBookings: ExtendedBooking[];
}

// No need to redefine fields that are already in the Booking interface
export interface ExtendedBooking extends Booking {
  // Additional fields specific to the dashboard view can be added here if needed
  customer_name?: string;
  service_name?: string;
}

export interface BookingFilterParams {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class ServiceProviderDashboardService {
  /**
   * Get dashboard stats for service provider
   */
  async getDashboardStats(): Promise<ServiceProviderDashboardStats> {
    try {
      return await apiService.get<ServiceProviderDashboardStats>('/service-provider-dashboard/stats');
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return default empty stats if API fails
      return {
        totalBookings: 0,
        totalServices: 0,
        activeServices: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
        businessStatus: 'inactive',
        rating: 0,
        recentBookings: []
      };
    }
  }

  /**
   * Get bookings for service provider with optional filtering
   */  async getProviderBookings(filters?: BookingFilterParams): Promise<{
    data: ExtendedBooking[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    try {
      let queryParams = '';

      if (filters) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('date_from', filters.startDate); // Match backend naming
        if (filters.endDate) params.append('date_to', filters.endDate); // Match backend naming
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        queryParams = `?${params.toString()}`;
      }

      // Get bookings from the bookings/provider endpoint
      const response = await apiService.get<any>(`/bookings/provider${queryParams}`);

      // Handle different response formats
      let bookingsData: ExtendedBooking[] = [];
      let meta = {
        total: 0,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        totalPages: 1
      };

      // Check if the response is an array or has data property
      if (Array.isArray(response)) {
        bookingsData = response;
        meta.total = response.length;
        meta.totalPages = Math.ceil(response.length / meta.limit);
      } else if (response && typeof response === 'object') {
        // Check if response has a data property (paginated response)
        if ('data' in response && Array.isArray(response.data)) {
          bookingsData = response.data;

          // If response includes metadata
          if ('meta' in response || 'pagination' in response) {
            const responseMeta = response.meta || response.pagination || {};
            meta = {
              total: responseMeta.total || bookingsData.length,
              page: responseMeta.page || responseMeta.current_page || filters?.page || 1,
              limit: responseMeta.limit || responseMeta.per_page || filters?.limit || 10,
              totalPages: responseMeta.totalPages || responseMeta.total_pages ||
                Math.ceil((responseMeta.total || bookingsData.length) / (filters?.limit || 10))
            };
          }
        }
      }

      return { data: bookingsData, meta };
    } catch (error) {
      console.error('Failed to fetch provider bookings:', error);
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
  }

  /**
   * Get notifications for service provider
   */
  async getNotifications(): Promise<any[]> {
    try {
      return await apiService.get<any[]>('/service-provider-dashboard/notifications');
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * Get business profile for service provider
   */
  async getBusinessProfile(): Promise<any> {
    try {
      // Import auth service to get the current user
      const { authService } = await import('./auth.service');

      // Get current user from auth service
      const userData = authService.getCurrentUser();
      if (!userData || !userData.id) {
        throw new Error('User not authenticated');
      }

      // Get all businesses and filter for current user in frontend
      const allBusinesses = await apiService.get<any[]>('/businesses');
      const userBusiness = allBusinesses.find(business => business.user_id === userData.id);

      return userBusiness || null;
    } catch (error) {
      console.error('Failed to fetch business profile:', error);
      return null;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<any> {
    try {
      return await apiService.patch(`/bookings/${bookingId}/status`, { status });
    } catch (error) {
      console.error(`Failed to update booking status to ${status}:`, error);
      throw error;
    }
  }
}

export const serviceProviderDashboardService = new ServiceProviderDashboardService();
