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

// Client-Side In-Memory Cache & In-Flight Request Deduplication Map
const apiCache = new Map();
const inFlightRequests = new Map();
const DEFAULT_CACHE_TTL = 120 * 1000; // 2 minutes

const getCacheKey = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${method}:${url}:${params}`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds to accommodate Render free-tier cold starts
});

// Cache invalidation utility
api.invalidateCache = (pattern) => {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

// Request interceptor for injecting Bearer token & Cache Check
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swadghar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Auto invalidate cache on mutations
    const method = (config.method || 'get').toLowerCase();
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      const url = config.url || '';
      if (url.includes('/foods')) api.invalidateCache('/foods');
      if (url.includes('/categories')) api.invalidateCache('/categories');
      if (url.includes('/settings')) api.invalidateCache('/settings');
      if (url.includes('/coupons')) api.invalidateCache('/coupons');
      if (url.includes('/franchises')) api.invalidateCache('/franchises');
      if (url.includes('/orders')) api.invalidateCache('/orders');
      if (url.includes('/reviews')) api.invalidateCache('/reviews');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with Auto-Retry and Caching
api.interceptors.response.use(
  (response) => {
    const config = response.config;
    const method = (config.method || 'get').toLowerCase();

    // Cache successful GET responses for ultra-fast instant UI re-renders
    if (method === 'get' && config.cache !== false) {
      const cacheKey = getCacheKey(config);
      const ttl = config.cacheTTL || DEFAULT_CACHE_TTL;
      apiCache.set(cacheKey, {
        data: response.data,
        expireAt: Date.now() + ttl,
      });
    }

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

// Wrapped GET with In-Flight Deduplication and Client Cache Hit
const originalGet = api.get.bind(api);
api.get = (url, config = {}) => {
  const mergedConfig = { url, method: 'get', ...config };
  const cacheKey = getCacheKey(mergedConfig);

  // 1. Check in-memory cache if caching not disabled
  if (config.cache !== false) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() < cached.expireAt) {
      return Promise.resolve(cached.data);
    }
  }

  // 2. In-Flight Request Deduplication (prevents duplicate simultaneous calls)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const promise = originalGet(url, config).finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  inFlightRequests.set(cacheKey, promise);
  return promise;
};

export default api;
