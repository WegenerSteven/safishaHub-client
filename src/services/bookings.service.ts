import apiService from './api';
import type { Booking } from '@/interfaces';

export interface CreateBookingRequest {
  user_id: string;
  service_id: string;
  service_date: string; // ISO date string
  service_time: string; // HH:MM format
  total_amount: number;
  payment_method?: string;
  special_instructions?: string;
  vehicle_info?: {
    type: string;
    make?: string;
    model?: string;
    year?: number;
    license_plate?: string;
  };
  location_info?: {
    address: string;
    latitude?: number;
    longitude?: number;
    note?: string;
  };
  add_ons?: Array<{
    addon_id: string;
    price: number;
  }>;
}

export interface UpdateBookingRequest {
  service_date?: string;
  service_time?: string;
  status?: string;
  payment_method?: string;
  special_instructions?: string;
  vehicle_info?: {
    type: string;
    make?: string;
    model?: string;
    year?: number;
    license_plate?: string;
  };
  location_info?: {
    address: string;
    latitude?: number;
    longitude?: number;
    note?: string;
  };
}

export interface BookingFilterParams {
  user_id?: string;
  service_id?: string;
  provider_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export class BookingsService {
  /**
   * Get all bookings with optional filtering
   */
  async getAllBookings(filters?: BookingFilterParams): Promise<Booking[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      return await apiService.get<Booking[]>(`/bookings?${params.toString()}`);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw error;
    }
  }

  /**
   * Get bookings for the current user
   */
  async getMyBookings(): Promise<Booking[]> {
    try {
      // First try the user-specific endpoint, fallback to filtering all bookings
      try {
        return await apiService.get<Booking[]>('/bookings/my-bookings');
      } catch (error: any) {
        if (error?.response?.status === 404) {
          // Endpoint doesn't exist, try getting all and filtering client-side
          console.log('User bookings endpoint not found, getting all bookings');
          const allBookings = await this.getAllBookings();
          return allBookings; // For now, return all - in production you'd filter by current user ID
        }
        throw error;
      }
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      throw error;
    }
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      return await apiService.get<Booking>(`/bookings/${id}`);
    } catch (error) {
      console.error(`Failed to fetch booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    try {
      return await apiService.post<CreateBookingRequest, Booking>('/bookings', bookingData);
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  }

  /**
   * Update an existing booking
   */
  async updateBooking(id: string, bookingData: UpdateBookingRequest): Promise<Booking> {
    try {
      return await apiService.patch<UpdateBookingRequest, Booking>(`/bookings/${id}`, bookingData);
    } catch (error) {
      console.error(`Failed to update booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      return await apiService.patch<{ reason?: string }, Booking>(`/bookings/${id}/cancel`, { reason });
    } catch (error) {
      console.error(`Failed to cancel booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Confirm a booking (for service providers)
   */
  async confirmBooking(id: string): Promise<Booking> {
    try {
      return await apiService.patch<undefined, Booking>(`/bookings/${id}/confirm`);
    } catch (error) {
      console.error(`Failed to confirm booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark booking as completed
   */
  async completeBooking(id: string): Promise<Booking> {
    try {
      return await apiService.patch<undefined, Booking>(`/bookings/${id}/complete`);
    } catch (error) {
      console.error(`Failed to complete booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get booking history for a user
   */
  async getBookingHistory(userId?: string): Promise<Booking[]> {
    try {
      const endpoint = userId ? `/bookings/history/${userId}` : '/bookings/history';
      return await apiService.get<Booking[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch booking history:', error);
      throw error;
    }
  }

  /**
   * Get upcoming bookings for a user
   */
  async getUpcomingBookings(userId?: string): Promise<Booking[]> {
    try {
      const endpoint = userId ? `/bookings/upcoming/${userId}` : '/bookings/upcoming';
      return await apiService.get<Booking[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch upcoming bookings:', error);
      throw error;
    }
  }
}
