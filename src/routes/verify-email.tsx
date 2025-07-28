import { createFileRoute } from '@tanstack/react-router'
import VerifyEmailComponent from '../components/VerifyEmail'; // adjust path if needed

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VerifyEmailComponent/>
}
