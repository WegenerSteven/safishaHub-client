import type { Business } from '../business/Business.interface';
import type { User } from '../auth/User.interface';

 export interface Service {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description?: string;
  category_type: CategoryType;
  service_type: ServiceType;
  vehicle_type: VehicleType;
  base_price: number;
  duration_minutes: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;

  // Optional nested objects for UI convenience
  category?: ServiceCategory;
  business?: Business;
  provider?: User;
  addons?: ServiceAddOn[];
}
export interface ServiceAddOn {
  id: string;
  service_id: string;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Optional nested objects for UI convenience
  service?: Service;
}
export interface ServiceCategory {
  
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface ServicePricing {
  id?: string;
  service_id?: string;
  vehicle_type: string;
  price: number;
  duration_minutes: number;
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
  BUS = 'bus',
  MOTORCYCLE = 'motorcycle',
  LUXURY = 'luxury',
  SPORTS = 'sports',
}

export enum CategoryType {
  CAR_WASH = 'car_wash',
  DETAILING = 'detailing',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  TIRE_SERVICES = 'tire_services',
  OTHERS = 'others',
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  MAINTENANCE = 'maintenance',
}

export enum PricingTier {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  TIERED = 'tiered',
}

// DTOs for API requests
export interface CreateServiceRequest {
  business_id: string;
  category_id: string;
  name: string;
  description?: string;
  base_price: number;
  duration_minutes: number;
  service_type: ServiceType;
  vehicle_types: VehicleType[];
  // status?: ServiceStatus;
  is_available?: boolean;
  image_url?: string;
  images?: string[];
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
  business_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}
