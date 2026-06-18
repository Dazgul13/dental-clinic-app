import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
      const branch = localStorage.getItem('currentBranch');
      if (branch) {
        config.headers['X-Clinic-Branch'] = branch;
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
  (error) => {
    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (error.response?.status === 423) {
      // Account locked
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Account locked. Please try again later.');
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      toast.error('Too many requests. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      toast.error('Request timeout. Please check your connection.');
    } else if (!error.response) {
      // Network error
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
