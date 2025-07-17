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
    activeServices?: number;
    totalEarnings?: number;
    pendingBookings?: number;
    completedBookings?: number;
    monthlyEarnings?: number;

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
// export interface ServiceProviderDashboardStats{
//   totalServices: number;
//   activeServices: number;
//   totalBookings: number;
//   pendingBookings: number;
//   completedBookings: number;
//   totalEarnings: number;
//   monthlyEarnings: number;
//   rating: number;
//   recentBookings: Booking[];
// }

// export interface ExtendedBooking extends Booking {
//   user?: User;
//   service?: Service;
// }