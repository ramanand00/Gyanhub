import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.url);
    console.log('Request Origin:', window.location.origin);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default API;