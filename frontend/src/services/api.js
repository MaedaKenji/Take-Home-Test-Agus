import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — show error toasts globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors?.[0]?.message) ||
      error.message ||
      'Terjadi kesalahan pada server';

    if (error.response?.status !== 404) {
      toast.error(message, { duration: 4000 });
    }

    return Promise.reject(error);
  }
);

export default api;
