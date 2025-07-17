import { createFileRoute } from '@tanstack/react-router';
import { ServiceManagement } from '@/components/service/ServiceManagement';

export const Route = createFileRoute('/dashboard/services/manage')({
  component: ServiceManagementPage,
});

function ServiceManagementPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Services</h1>
      <p className="text-muted-foreground mb-8">
        Create and manage your business services
      </p>
      <ServiceManagement />
    </div>
  );
}
