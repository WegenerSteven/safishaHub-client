import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/service-provider/bookings')({
  component: () => <Navigate to="/dashboard/provider-bookings" />,
});
