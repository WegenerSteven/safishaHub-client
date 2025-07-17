export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role: 'customer' | 'service_provider' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  is_service_provider: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
