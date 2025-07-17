import { BookingStatus } from '../index';
import type { User } from '../user/User.interface';
import type { Service } from '../service/Service.interface';
import type { Payment } from '../payment/Payment.interface';

export interface Booking {
    id: string;
    booking_number?: string;
    user_id: string;
    service_id: string;
    service_date: string;
    service_time: string;
    status: BookingStatus;
    total_amount: string | number;
    special_instructions?: string;
    vehicle_info?: {
        type: string;
        make?: string;
        model?: string;
        year?: number;
        license_plate?: string;
    };
    // Relations
    user?: User;
    service?: Service;
    payment?: Payment;
    review?: any;
    created_at: string;
    updated_at: string;
    
    // Legacy fields for compatibility
    customerId?: string;
    serviceId?: string;
    serviceProviderId?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    totalAmount?: number;
    paymentStatus?: string;
    specialInstructions?: string;
    serviceProvider?: {
        id: string;
        businessName: string;
        phone: string;
        rating?: number;
    };
    customer?: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

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