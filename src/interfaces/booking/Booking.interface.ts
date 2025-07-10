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
    total_amount: number;
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