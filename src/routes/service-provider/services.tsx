import { createFileRoute } from '@tanstack/react-router';
import { ServiceManagement } from '@/components/service-provider/ServiceManagement';

export const Route = createFileRoute('/service-provider/services')({
  component: ServiceManagement,
});
