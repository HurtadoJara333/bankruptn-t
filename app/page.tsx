import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to login by default
  // The middleware will handle redirection to dashboard if there's a session
  redirect('/login');
}