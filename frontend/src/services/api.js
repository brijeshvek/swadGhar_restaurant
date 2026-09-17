import axios from 'axios';

// Dynamically determine Base URL (uses VITE_API_URL or defaults to live Render backend in production / Netlify)
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // Automatic fallback for production or when hosted on Netlify
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    return 'https://swadghar-restaurant-backend.onrender.com/api';
  }

  if (import.meta.env.PROD) {
    return 'https://swadghar-restaurant-backend.onrender.com/api';
  }

  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds to accommodate Render free-tier cold starts
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

// Response interceptor with Auto-Retry for cold starts & timeouts
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const config = error.config;

    // Retry on timeout or network connection error for GET requests (up to 2 retries)
    if (
      config &&
      config.method === 'get' &&
      (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || !error.response)
    ) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        // Wait 1.5s before retrying
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return api(config);
      }
    }

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
