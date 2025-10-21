'use client';

import { useAuth } from '@/lib/auth';
import Loading from './loading';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    // This shouldn't happen because of the middleware
    window.location.href = '/auth/login';
    return null;
  }

  // Redirect to the appropriate dashboard based on user role
  switch (user.role) {
    case 'ADMIN':
      window.location.href = '/admin/dashboard';
      break;
    case 'TEACHER':
      window.location.href = '/teacher/dashboard';
      break;
    case 'PARENT':
      window.location.href = '/parent/dashboard';
      break;
    default:
      window.location.href = '/auth/login';
  }

  return <Loading />;
}