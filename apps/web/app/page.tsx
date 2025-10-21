'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Loading from './loading';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        // Redirect to the appropriate dashboard based on user role
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'TEACHER':
            router.push('/teacher/dashboard');
            break;
          case 'PARENT':
            router.push('/parent/dashboard');
            break;
          default:
            router.push('/auth/login');
        }
      }
    }
  }, [user, isLoading, router]);

  return <Loading />;
}