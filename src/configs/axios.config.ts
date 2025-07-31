import { logout } from '@/store/auth/auth.slice';
import { store } from '@/store/store';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor to add Bearer token
axios.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle authentication errors
export const useInterceptorsResponse = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Token is invalid or expired, logout user
    store.dispatch(logout());

    // Clear token from localStorage
    localStorage.removeItem('auth_token');

    // Redirect to login page if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Handle other error status codes as needed
  if (error.response?.status === 403) {
    console.error('Access forbidden');
  }

  if (error.response?.status && error.response?.status >= 500) {
    console.error('Server error');
  }

  return Promise.reject(error);
};

axios.interceptors.response.use((response) => response, useInterceptorsResponse);

export default axios;
