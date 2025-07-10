import { createFileRoute } from '@tanstack/react-router';
import { BookingManagement } from '@/components/service-provider/BookingManagement';

export const Route = createFileRoute('/service-provider/bookings')({
  component: BookingManagement,
});
