export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'service_provider' | 'admin';
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  address?: string;
  date_of_birth?: string;
  preferred_contact_method?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  total_bookings: number;
  total_spent: number;
  loyalty_tier: string;
  loyalty_points: number;
}

export interface ServiceProviderProfile {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  address: string;
  phone?: string;
  rating: number;
  total_services: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  user: UserProfile;
  profile: CustomerProfile | ServiceProviderProfile | null;
  profileType: 'customer' | 'service_provider' | 'admin';
}