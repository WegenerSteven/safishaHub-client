export interface Booking{
    id: string;
    customerId: string;
    serviceId: string;
    serviceProviderId: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    totalAmount: number;
    paymentStatus: 'pending' | 'paid' | 'failed'| 'refunded';
    specialInstructions?: string;
    vehicleType?: 'sedan' | 'suv' | 'truck' | 'motorcycle'| 'other';
    location?:{
        address: string;
        latitude?: number;
        longitude?: number;
        note?: string;
    }
    service:{
        id: string;
        name: string;
        type: string;
        estimatedDuration?: number;
    }
    serviceProvider:{
        id: string;
        businessName: string;
        phone: string;
        rating?: number;
    }
    customer:{
        id: string;
        name: string;
        phone: string;
        email: string;
    }
    createdAt: string;
    updatedAt: string;
}