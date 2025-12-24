import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (phone: string, password: string) => {
    const formData = new FormData();
    formData.append('username', phone);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  register: async (data: {
    phone: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Courses API
export const coursesApi = {
  getAll: async (params?: { page?: number; size?: number; category?: string }) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get(`/courses/${slug}`);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<{
    first_name: string;
    last_name: string;
    email: string;
  }>) => {
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;
    const response = await api.patch(`/users/${user?.id}`, data);
    return response.data;
  },
};

