// services/api.js
import axios from "axios";

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let isRefreshing = false;
let failedQueue = [];
let refreshPromise = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry refresh token requests
    if (originalRequest.url?.includes('/refresh-token')) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Check if we need to refresh token
    if (error.response?.data?.code === 'ACCESS_TOKEN_EXPIRED' || 
        error.response?.data?.code === 'INVALID_ACCESS_TOKEN') {
      
      originalRequest._retry = true;

      // If refresh is in progress, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Create refresh promise if not exists
        if (!refreshPromise) {
          refreshPromise = API.post('/api/auth/refresh-token', { refreshToken });
        }

        const response = await refreshPromise;
        
        if (response.data.success) {
          const newAccessToken = response.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          
          // Update user data if provided
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          // Process queued requests
          processQueue(null, newAccessToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    // For other errors
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Token helper functions
export const tokenHelpers = {
  // Get tokens
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Set tokens
  setTokens: (accessToken, refreshToken, user) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Clear tokens
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Check if tokens exist
  hasTokens: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Parse JWT token
  parseJwt: (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired: (token) => {
    if (!token) return true;
    const decoded = tokenHelpers.parseJwt(token);
    if (!decoded) return true;
    const expiry = decoded.exp * 1000;
    return Date.now() >= expiry;
  },

  // Get token expiry time
  getTokenExpiry: (token) => {
    const decoded = tokenHelpers.parseJwt(token);
    if (!decoded) return null;
    return new Date(decoded.exp * 1000);
  },

  // Get remaining time in seconds
  getTokenRemainingTime: (token) => {
    const expiry = tokenHelpers.getTokenExpiry(token);
    if (!expiry) return 0;
    return Math.floor((expiry.getTime() - Date.now()) / 1000);
  },

  // Auto refresh token before expiry
  setupAutoRefresh: (interval = 60000) => {
    return setInterval(async () => {
      const token = tokenHelpers.getAccessToken();
      if (!token) return;

      const remainingTime = tokenHelpers.getTokenRemainingTime(token);
      if (remainingTime > 0 && remainingTime < 300) {
        try {
          const refreshToken = tokenHelpers.getRefreshToken();
          if (refreshToken) {
            const response = await API.post('/api/auth/refresh-token', { refreshToken });
            if (response.data.success) {
              localStorage.setItem('accessToken', response.data.accessToken);
              if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
              }
              console.log('✅ Token auto-refreshed successfully');
            }
          }
        } catch (error) {
          console.error('❌ Auto-refresh failed:', error);
        }
      }
    }, interval);
  },
};

export default API;