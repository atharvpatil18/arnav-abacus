import axios from 'axios';
import { toast } from 'sonner';

import { axiosInstance } from './axios';

export const apiClient = axiosInstance;

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Show error message from API if available
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    toast.error(message);

    if (error.response?.status === 401) {
      window.location.href = '/auth/login';
    }
    
    return Promise.reject(error);
  },
);

// Base API functions for each entity
export const getUsers = () => apiClient.get('/users').then(res => res.data);
export const getUser = (id: number) => apiClient.get(`/users/${id}`).then(res => res.data);

export const getStudents = () => apiClient.get('/students').then(res => res.data);
export const getStudent = (id: number) => apiClient.get(`/students/${id}`).then(res => res.data);

export const getBatches = () => apiClient.get('/batches').then(res => res.data);
export const getBatch = (id: number) => apiClient.get(`/batches/${id}`).then(res => res.data);

export const getTests = () => apiClient.get('/tests').then(res => res.data);
export const getTest = (id: number) => apiClient.get(`/tests/${id}`).then(res => res.data);

export const getFees = () => apiClient.get('/fees').then(res => res.data);
export const getFee = (id: number) => apiClient.get(`/fees/${id}`).then(res => res.data);

// Analytics endpoints
export const getAnalytics = (endpoint: string) => apiClient.get(`/analytics/${endpoint}`).then(res => res.data);