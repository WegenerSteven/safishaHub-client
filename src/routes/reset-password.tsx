import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordForm from '../components/ResetPasswordForm' // adjust path if needed

export const Route = createFileRoute('/reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResetPasswordForm />;
}
