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

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    accountType: 'customer' | 'service_provider';
    password: string;
    phone?: string; // Make phone optional since it might not be provided in the form
}
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
