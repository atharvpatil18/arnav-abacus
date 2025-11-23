import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './api';
import { toast } from 'sonner';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
  phoneNumber: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
}

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<User>('/auth/me');
        return data;
      } catch {
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/'),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      // Token is now stored in httpOnly cookie by the server
      toast.success('Logged in successfully');
      router.push(getHomeRoute(data.user.role));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Registered successfully');
      router.push(getHomeRoute(data.user.role));
    },
  });

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch {
      // Error is handled by the interceptor
    }
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
  };
}

function getHomeRoute(role: User['role']) {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TEACHER':
      return '/teacher/dashboard';
    case 'PARENT':
      return '/parent/dashboard';
    default:
      return '/';
  }
}