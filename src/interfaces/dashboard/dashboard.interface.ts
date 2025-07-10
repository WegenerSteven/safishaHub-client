import type { Booking } from '../booking/Booking.interface';

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'service_provider' | 'admin';
  };
  stats?: {
    totalBookings?: number;
    totalSpent?: number;
    loyaltyTier?: string;
    loyaltyPoints?: number;
    totalServices?: number;
    rating?: number;
    isVerified?: boolean;
    businessName?: string;
    monthlyRevenue?: number;
  };
  recentBookings?: Booking[];
  upcomingBookings?: Booking[];
  popularServices?: {
    id: string;
    name: string;
    bookingCount: number;
  }[];
}
