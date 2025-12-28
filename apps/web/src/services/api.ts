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
    role?: 'student' | 'teacher';
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getMe: async (accessToken?: string) => {
    const response = await api.get(
      '/auth/me',
      accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
    );
    return response.data;
  },

  verifyPhone: async (phone: string, code: string) => {
    const response = await api.post('/auth/verify', { phone, code });
    return response.data;
  },

  sendTelegramCode: async (phone: string) => {
    const response = await api.post('/auth/send-telegram-code', { phone });
    return response.data;
  },

  sendTelegramCodeLogin: async (phone: string) => {
    const response = await api.post('/auth/send-telegram-code-login', { phone });
    return response.data;
  },

  verifyTelegramCode: async (phone: string, code: string, returnTokens: boolean = true) => {
    const response = await api.post('/auth/verify-telegram-code', {
      phone,
      code,
      return_tokens: returnTokens,
    });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/auth/account');
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

  create: async (data: {
    name: string;
    description?: string;
    short_description?: string;
    duration_months?: number;
    lessons_per_week?: number;
    lesson_duration_minutes?: number;
    price: number;
    discount_price?: number;
    level?: string;
    category?: string;
    tags?: string;
  }) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  update: async (courseId: string, data: Partial<{
    name: string;
    description?: string;
    short_description?: string;
    duration_months?: number;
    lessons_per_week?: number;
    lesson_duration_minutes?: number;
    price: number;
    discount_price?: number;
    level?: string;
    category?: string;
    tags?: string;
  }>) => {
    const response = await api.patch(`/courses/${courseId}`, data);
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
    avatar_url: string;
    specialization: string;
  }>) => {
    const user = useAuthStore.getState().user;
    const response = await api.patch(`/users/${user?.id}`, data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Admin APIs
  listUsers: async (params?: {
    page?: number;
    size?: number;
    role?: string;
    search?: string;
    is_active?: boolean;
  }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUser: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  createUser: async (data: {
    phone: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    password?: string;
  }) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (userId: string, data: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
  }>) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

// Admin Courses API
export const adminCoursesApi = {
  listCourses: async (params?: {
    page?: number;
    size?: number;
    category?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getCourse: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (data: any) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  updateCourse: async (courseId: string, data: any) => {
    const response = await api.patch(`/courses/${courseId}`, data);
    return response.data;
  },

  deleteCourse: async (courseId: string) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  publishCourse: async (courseId: string) => {
    const response = await api.post(`/courses/${courseId}/publish`);
    return response.data;
  },
};

// Admin Payments API
export const adminPaymentsApi = {
  listPayments: async (params?: {
    page?: number;
    size?: number;
    user_id?: string;
    status?: string;
  }) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  getPayment: async (paymentId: string) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  createPayment: async (data: any) => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  confirmPayment: async (paymentId: string) => {
    const response = await api.post(`/payments/${paymentId}/confirm`);
    return response.data;
  },
};

// Tests API
export const testsApi = {
  getTests: async (params?: { page?: number; size?: number; course_id?: string; test_type?: string }) => {
    const response = await api.get('/tests', { params });
    return response.data;
  },

  getTest: async (testId: string, accessKey?: string) => {
    const params = accessKey ? { access_key: accessKey } : undefined;
    const response = await api.get(`/tests/${testId}`, { params });
    return response.data;
  },

  createTest: async (data: {
    course_id?: string;
    test_type?: string;
    title: string;
    description?: string;
    duration: number;
    max_score: number;
    passing_score: number;
    is_active?: boolean;
    available_from?: string;
    available_until?: string;
    access_key?: string;
    scoring_model?: string;
    test_config?: Record<string, any>;
    questions?: Array<{
      question_text: string;
      question_type?: string;
      order_index?: number;
      points?: number;
      options?: Array<{
        option_text: string;
        is_correct: boolean;
        order_index?: number;
      }>;
    }>;
  }) => {
    const response = await api.post('/tests', data);
    return response.data;
  },

  updateTest: async (testId: string, data: Partial<{
    title: string;
    description?: string;
    duration: number;
    max_score: number;
    passing_score: number;
    is_active?: boolean;
    available_from?: string;
    available_until?: string;
    test_type?: string;
    access_key?: string;
    scoring_model?: string;
    test_config?: Record<string, any>;
  }>) => {
    const response = await api.patch(`/tests/${testId}`, data);
    return response.data;
  },

  deleteTest: async (testId: string) => {
    const response = await api.delete(`/tests/${testId}`);
    return response.data;
  },

  addQuestion: async (testId: string, data: {
    question_text: string;
    question_type?: string;
    order_index?: number;
    points?: number;
    options?: Array<{
      option_text: string;
      is_correct: boolean;
      order_index?: number;
    }>;
  }) => {
    const response = await api.post(`/tests/${testId}/questions`, data);
    return response.data;
  },

  startTest: async (testId: string) => {
    const response = await api.post(`/tests/${testId}/start`);
    return response.data;
  },

  submitTest: async (testId: string, answers: Record<string, string[]>) => {
    const response = await api.post(`/tests/${testId}/submit`, { answers });
    return response.data;
  },

  getResult: async (testId: string) => {
    const response = await api.get(`/tests/${testId}/result`);
    return response.data;
  },
};

