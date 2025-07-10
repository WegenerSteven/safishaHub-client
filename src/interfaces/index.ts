// Enum for booking statuses to ensure consistency across the application
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

// Enum for service statuses
export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

// Enum for service types
export enum ServiceType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  MOBILE = 'mobile',
  FIXED = 'fixed',
  BOTH = 'both'
}

export * from "./auth/User.interface";
export * from "./auth/AuthResponse.interface";
export * from "./booking/Booking.interface";
export * from "./service/Service.interface";
export * from "./dashboard/dashboard.interface";