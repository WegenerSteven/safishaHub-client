export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'CUSTOMER' | 'SERVICE_PROVIDER' | 'ADMIN';
    phone?: string;
    is_active: boolean;
    is_verified?: boolean;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    
    // Customer specific fields
    address?: string;
    date_of_birth?: string;
    gender?: string;
    loyalty_points?: number;
    total_bookings?: number;
    
    // Service Provider specific fields  
    business_name?: string;
    business_type?: string;
    business_description?: string;
    business_address?: string;
    business_license?: string;
    business_phone?: string;
    business_email?: string;
    business_image?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    operating_hours?: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };
    latitude?: number;
    longitude?: number;
    rating?: number;
    total_reviews?: number;
    years_of_experience?: number;
    
    // Legacy compatibility
    name?: string; // Computed from first_name + last_name
    firstName?: string; // Alias for first_name
    lastName?: string; // Alias for last_name
    isEmailVerified?: boolean; // Alias for email_verified_at check
    isVerified?: boolean; // Alias for is_verified
    createdAt?: string; // Alias for created_at
    updatedAt?: string; // Alias for updated_at
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface CustomerRegistrationData {
    address?: string;
    date_of_birth?: string;
    preferred_contact_method?: 'email' | 'sms' | 'phone';
    email_notifications?: boolean;
    sms_notifications?: boolean;
}

export interface ServiceProviderRegistrationData {
    business_name: string;
    description?: string;
    address: string;
    phone?: string;
}

export interface RegisterRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'customer' | 'service_provider';
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
