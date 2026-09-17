import axios from 'axios';

// Dynamically determine Base URL (falls back to local proxy in dev or uses VITE_API_URL in production Netlify deploy)
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Request interceptor for injecting Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swadghar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    
    // Auto logout on 401 Unauthorized if token expired
    if (error.response?.status === 401) {
      if (localStorage.getItem('swadghar_token')) {
        localStorage.removeItem('swadghar_token');
        localStorage.removeItem('swadghar_user');
      }
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }
);

export default api;
