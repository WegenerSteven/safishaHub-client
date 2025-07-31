import { createFileRoute } from '@tanstack/react-router'
import { useSearch } from '@tanstack/react-router';
import VerifyEmailComponent from '../components/VerifyEmail'; // adjust path if needed

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent,
  validateSearch: (search) =>({
    token: search.token as string | undefined,
  })
})

function RouteComponent() {
  const search = useSearch({from: '/verify-email'});
  const token = search.token;
  return <VerifyEmailComponent token={token} />;
}
