import { createFileRoute } from '@tanstack/react-router';
import { BusinessRegistration } from '../../components/business/BusinessRegistration';

export const Route = createFileRoute('/dashboard/register-business')({
  component: BusinessRegistration,
});
