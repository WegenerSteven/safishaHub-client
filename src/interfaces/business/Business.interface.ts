import type { User } from '@/interfaces/auth/User.interface';
import type { OperatingHours } from '@/interfaces/common/OperatingHours.interface';

export interface Business {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  location_id?: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  image?: string;
  rating: number;
  total_services: number;
  total_reviews: number;
  is_verified: boolean;
  latitude?: number;
  longitude?: number;
  user?: User;
  operating_hours?: BusinessHours;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  hours: OperatingHours;
  created_at: string;
  updated_at: string;
}
