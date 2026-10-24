import axios from 'axios';

/**
 * api — the shared Axios instance for all API calls.
 * baseURL points to /api which Vite proxies to http://localhost:5000/api
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send cookies (refresh token) with every request
});

/**
 * REQUEST interceptor — attaches the JWT token to every request header.
 * You never manually add "Bearer token" in your components — it's automatic.
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
 * RESPONSE interceptor — handles 401 (token expired) automatically.
 *
 * When any API call returns 401:
 *   1. Try POST /api/auth/refresh to get a new access token
 *   2. If refresh succeeds → retry the original request silently
 *   3. If refresh fails → clear token, redirect to /login
 *
 * IMPORTANT — we skip the refresh logic for these routes:
 *   - /auth/me      → called by initAuth on app boot. If this 401s,
 *                     initAuth handles it itself (clears token gracefully).
 *                     We must NOT intercept it or we get a redirect loop.
 *   - /auth/refresh → the refresh call itself. If this 401s, the refresh
 *                     token is expired. Intercepting it would cause infinite loop.
 *   - /auth/login   → login failures should show error message, not redirect.
 *   - /auth/logout  → logout should always succeed client-side.
 */
const SKIP_REFRESH_URLS = ['/auth/me', '/auth/refresh', '/auth/login', '/auth/logout'];

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Check if this is a URL we should skip refresh logic for
    const shouldSkip = SKIP_REFRESH_URLS.some((url) => requestUrl.includes(url));

    // Only try to refresh on 401 errors, first attempt only, and not skipped URLs
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkip) {

      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to get a new access token using the refresh token cookie
        const { data } = await api.post('/auth/refresh');
        const newToken = data.token;

        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token is also expired — full logout
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
