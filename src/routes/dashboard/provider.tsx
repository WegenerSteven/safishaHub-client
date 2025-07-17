import { createFileRoute } from '@tanstack/react-router';
import { ServiceProviderLayout } from '@/components/service-provider/ServiceProviderLayout';

export const Route = createFileRoute('/dashboard/provider')({
  component: ServiceProviderLayout,
});
