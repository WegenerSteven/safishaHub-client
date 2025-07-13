import type { Business } from '../business/Business.interface';
import type { User } from '../auth/User.interface';

export interface Service {
  id: string;
  provider_id: string;
  category_id: string;
  business_id?: string;
  location_id?: string;
  name: string;
  description?: string;
  short_description?: string;
  base_price: string; // API returns as string
  price?: number; // For backward compatibility
  currency?: string;
  discounted_price?: string;
  duration_minutes: number;
  service_type: ServiceType;
  vehicle_type: VehicleType; // API returns single vehicle_type
  vehicle_types?: VehicleType[]; // For backward compatibility
  status: ServiceStatus;
  is_active: boolean;
  is_available: boolean;
  images?: string[];
  image_url?: string;
  features?: string[];
  requirements?: string[];
  booking_count?: number;
  average_rating?: string;
  review_count?: number;
  cancellation_policy?: string;
  refund_policy?: string;
  terms_conditions?: string;
  metadata?: Record<string, any>;
  provider?: User;
  business?: Business;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePricing {
  id?: string;
  service_id?: string;
  vehicle_type: VehicleType;
  base_price: number;
  currency: string;
  pricing_type: PricingType;
  min_price?: number;
  max_price?: number;
  price_per_hour?: number;
  discount_percentage?: number;
  is_active: boolean;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

export enum ServiceType {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  DELUXE = 'deluxe',
  CUSTOM = 'custom',
}

export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  HATCHBACK = 'hatchback',
  TRUCK = 'truck',
  VAN = 'van',
  MOTORCYCLE = 'motorcycle',
  LUXURY = 'luxury',
  SPORTS = 'sports',
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  MAINTENANCE = 'maintenance',
}

export enum PricingType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  TIERED = 'tiered',
}

// DTOs for API requests
export interface CreateServiceRequest {
  provider_id: string;
  category_id: string;
  location_id?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  duration_minutes: number;
  service_type: ServiceType;
  vehicle_types: VehicleType[];
  status?: ServiceStatus;
  is_available?: boolean;
  images?: string[];
  features?: string[];
  requirements?: string[];
  cancellation_policy?: string;
  refund_policy?: string;
  terms_conditions?: string;
  metadata?: Record<string, any>;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {}

export interface ServiceFilterParams {
  category_id?: string;
  location_id?: string;
  service_type?: ServiceType;
  vehicle_type?: VehicleType;
  min_price?: number;
  max_price?: number;
  status?: ServiceStatus;
  is_available?: boolean;
  provider_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}
