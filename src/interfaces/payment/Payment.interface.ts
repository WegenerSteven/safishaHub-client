export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_id?: string;
  transaction_date?: string;
  payment_provider?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
