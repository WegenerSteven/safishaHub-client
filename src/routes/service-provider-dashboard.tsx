import { createFileRoute } from '@tanstack/react-router';
import { ServiceProviderDashboard } from '@/components/service-provider/ServiceProviderDashboard';

export const Route = createFileRoute('/service-provider-dashboard')({
  component: ServiceProviderDashboard,
});
