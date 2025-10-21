import axios from 'axios';

const axiosInstance = axios.create({
  // Prefer explicit NEXT_PUBLIC_API_URL set in apps/web/.env.local. If not present,
  // default to the backend API port (3000). Previously the fallback was 3001 which
  // pointed to the Next.js dev server and caused relative requests (e.g. `/auth/me`)
  // to hit Next.js and return 404. Using 3000 ensures API calls reach the NestJS
  // backend by default.
  baseURL: (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Add a request interceptor for authentication
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers = { Authorization: `Bearer ${token}` };
    }
  }
  return config;
});

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };