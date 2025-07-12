export interface User {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'service_provider' | 'admin';
    isEmailVerified: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
    isVerified?: boolean; // Optional field for service providers
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
    customer_data?: CustomerRegistrationData;
    provider_data?: ServiceProviderRegistrationData;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
