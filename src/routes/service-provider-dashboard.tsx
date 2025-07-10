import { createFileRoute } from '@tanstack/react-router';
import { ServiceProviderDashboard } from '../components/dashboard/ServiceProviderDashboard';

export const Route = createFileRoute('/service-provider-dashboard')({
  component: ServiceProviderDashboard,
});
