import { createFileRoute } from '@tanstack/react-router'
import { PaymentPage } from '@/components/dashboard/PaymentPage'

export const Route = createFileRoute('/dashboard/payments')({
  component: PaymentPage,
})
