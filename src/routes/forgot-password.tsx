import { createFileRoute } from '@tanstack/react-router'
import ForgotPasswordForm from '../components/ForgotPasswordForm' // adjust path if needed

export const Route = createFileRoute('/forgot-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ForgotPasswordForm />;
}
