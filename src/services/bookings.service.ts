import apiService from './api';
import type { Booking } from '@/interfaces';
import type { CreateBookingRequest, UpdateBookingRequest, BookingFilterParams } from '@/interfaces/booking/Booking.interface';

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
      console.log('Fetching user bookings');

      // First try the user-specific endpoint, fallback to filtering all bookings
      try {
        const response = await apiService.get<Booking[] | { data: Booking[] }>('/bookings/my-bookings');
        console.log('API response for user bookings:', response);

        // Handle both array and object with data property responses
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        } else {
          console.warn('Unexpected response format for user bookings:', response);
          return []; // Return empty array instead of throwing
        }
      } catch (error: any) {
        console.warn('Error fetching from my-bookings endpoint:', error?.response?.status, error?.message);
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
      return []; // Return empty array instead of throwing to prevent UI crashes
    }
  }

  /**
   * Get bookings where the current user is the service provider
   */
  async getProviderBookings(): Promise<Booking[]> {
    try {
      const response = await apiService.get<Booking[] | { data: Booking[] }>('/bookings/provider');

      // Handle both array and object with data property responses
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      }

      // If we can't determine the structure, log it and return empty array
      console.error('Unexpected provider bookings response format:', response);
      return [];
    } catch (error) {
      console.error('Failed to fetch provider bookings:', error);
      return []; // Return empty array instead of throwing to prevent UI crashes
    }
  }

  /**
   * Get booking by ID
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
      console.log('Creating booking with data:', JSON.stringify(bookingData));

      // Ensure all required fields are present
      if (!bookingData.service_id) {
        throw new Error('Service ID is required');
      }

      if (!bookingData.service_date) {
        throw new Error('Service date is required');
      }

      if (!bookingData.service_time) {
        throw new Error('Service time is required');
      }

      const response = await apiService.post<CreateBookingRequest, Booking>('/bookings', bookingData);
      console.log('Booking created successfully:', response);
      return response;
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
}

