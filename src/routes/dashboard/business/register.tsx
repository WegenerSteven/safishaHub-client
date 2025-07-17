import { createFileRoute } from '@tanstack/react-router';
import { BusinessRegistrationForm } from '@/components/business/BusinessRegistrationForm';

export const Route = createFileRoute('/dashboard/business/register')({
  component: BusinessRegistrationPage,
});

function BusinessRegistrationPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Business Registration</h1>
      <p className="text-muted-foreground mb-8">
        Register your business to start offering services on SafishaHub
      </p>
      <BusinessRegistrationForm />
    </div>
  );
}
