import axios from 'axios';

/**
 * api — a pre-configured Axios instance.
 * Instead of writing the full URL every time, you call api.get('/auth/me')
 * and Axios automatically prepends the base URL.
 */
const api = axios.create({
  baseURL: '/api', // Vite proxies this to http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor — runs BEFORE every request is sent.
 * It reads the auth token from localStorage and attaches it to the headers.
 * This means you never have to manually add the token in each API call.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — runs AFTER every response.
 * If the server returns 401 (Unauthorized), the token has expired.
 * We clear it from storage so the user gets redirected to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // In a real app you'd dispatch a logout action here or redirect
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
