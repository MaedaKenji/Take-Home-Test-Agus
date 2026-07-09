import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — show error toasts globally + handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Redirect to login on unauthorized
    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors?.[0]?.message) ||
      error.message ||
      'Terjadi kesalahan pada server';

    if (status !== 404) {
      toast.error(message, { duration: 4000 });
    }

    return Promise.reject(error);
  }
);

export default api;
