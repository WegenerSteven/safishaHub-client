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
  };
}
