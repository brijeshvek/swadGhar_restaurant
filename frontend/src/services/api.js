import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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
