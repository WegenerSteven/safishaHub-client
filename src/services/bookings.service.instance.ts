import { BookingsService } from './bookings.service';
import type { BookingFilterParams } from '../interfaces/booking/Booking.interface';
import type { Booking } from '@/interfaces';

// Create an instance of the bookings service
const bookingsService = new BookingsService();

// Export service methods individually
export const getMyBookings = async (): Promise<Booking[]> => {
  return bookingsService.getMyBookings();
};

export const getProviderBookings = async (): Promise<Booking[]> => {
  try {
    const result = await bookingsService.getProviderBookings();
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error in getProviderBookings:', error);
    return []; // Return empty array to prevent UI crashes
  }
};

export const getBookingById = async (bookingId: string): Promise<Booking> => {
  return bookingsService.getBookingById(bookingId);
};

export const getAllBookings = async (filters?: BookingFilterParams): Promise<Booking[]> => {
  return bookingsService.getAllBookings(filters);
};

export const createBooking = async (bookingData: any): Promise<Booking> => {
  return bookingsService.createBooking(bookingData);
};

export const updateBooking = async (bookingId: string, bookingData: any): Promise<Booking> => {
  return bookingsService.updateBooking(bookingId, bookingData);
};

export const cancelBooking = async (bookingId: string): Promise<Booking> => {
  return bookingsService.cancelBooking(bookingId);
};

export default bookingsService;
