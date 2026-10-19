import axios from 'axios';

/**
 * api — the shared Axios instance for all API calls.
 * baseURL points to /api which Vite proxies to http://localhost:5000/api
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // IMPORTANT: send cookies (refresh token) with every request
});

/**
 * REQUEST interceptor — runs before every outgoing request.
 * Reads the token from localStorage and adds it to the Authorization header.
 * This means you never manually add "Bearer token" in your components.
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
 * RESPONSE interceptor — runs after every response.
 *
 * The interesting case is a 401 (Unauthorized) — this means the access token expired.
 *
 * Flow:
 * 1. Any API call returns 401
 * 2. This interceptor catches it
 * 3. We call POST /api/auth/refresh — the browser automatically sends
 *    the httpOnly refresh token cookie (that's why withCredentials: true matters)
 * 4. Server verifies the refresh token and returns a new access token
 * 5. We save the new token to localStorage
 * 6. We retry the original failed request with the new token
 * 7. The component that made the original call never knows this happened
 *
 * The _retry flag prevents infinite loops:
 * If the refresh itself returns 401, we don't try to refresh again.
 * We redirect to login instead.
 */
let isRefreshing = false;        // Are we currently refreshing?
let failedQueue = [];            // Requests waiting for the refresh to complete

/**
 * processQueue — when refresh completes, retry all queued requests.
 * If refresh failed, reject them all.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // Success — just return the response unchanged

  async (error) => {
    const originalRequest = error.config;

    // Only try to refresh on 401 errors and only once per request (_retry flag)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest); // Retry with new token
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true; // Mark so we don't retry infinitely
      isRefreshing = true;

      try {
        // Call the refresh endpoint — the httpOnly cookie is sent automatically
        const { data } = await api.post('/auth/refresh');
        const newToken = data.token;

        // Save the new access token
        localStorage.setItem('token', newToken);

        // Update the Authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Retry all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (refresh token also expired) — log user out
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
