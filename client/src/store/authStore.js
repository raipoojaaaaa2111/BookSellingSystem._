import { create } from 'zustand';
import api from '../services/api';

/**
 * useAuthStore — Zustand store for all authentication state.
 *
 * State:
 *   user       — the logged-in user object (null if not logged in)
 *   token      — the JWT access token string
 *   isLoading  — true while an auth API call is in progress
 *   isInitialized — true once initAuth() has run (prevents flash of login page)
 *   error      — last error message from an auth action
 *
 * Actions:
 *   initAuth   — called once on app boot to restore session from localStorage
 *   login      — POST /api/auth/login
 *   register   — POST /api/auth/register
 *   logout     — POST /api/auth/logout + clear state
 *   clearError — dismiss the error message
 */
const useAuthStore = create((set, get) => ({
  // ─── State ────────────────────────────────────────────────────────────────
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isInitialized: false, // Has initAuth run yet?
  error: null,

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * initAuth — runs once when the app first loads (called in main.jsx).
   *
   * Problem it solves:
   *   When you refresh the page, React starts fresh. Zustand loses the `user`
   *   object. But the token is still in localStorage. So the app incorrectly
   *   thinks the user is logged out.
   *
   * Solution:
   *   On app boot, if a token exists, call GET /api/auth/me.
   *   The server verifies the token and returns the user data.
   *   We put that user back into Zustand.
   *   If the token is expired/invalid, we clear it and show the login page.
   */
  initAuth: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      // No token at all — user has never logged in or already logged out
      set({ isInitialized: true });
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, isInitialized: true });
    } catch (err) {
      // Token is expired or invalid — clear everything
      localStorage.removeItem('token');
      set({ user: null, token: null, isInitialized: true });
    }
  },

  /**
   * login — sends credentials, stores token and user on success
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * register — creates account, stores token and user on success
   */
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err) {
      // Handle validation errors from the server (array of errors)
      const serverError = err.response?.data;
      let message;

      if (serverError?.errors?.length) {
        // Show the first validation error from the server
        message = serverError.errors[0].message;
      } else {
        message = serverError?.message || 'Registration failed. Please try again.';
      }

      set({ error: message, isLoading: false });
    }
  },

  /**
   * logout — tells the server to blacklist the token, then clears local state
   */
  logout: async () => {
    try {
      await api.post('/auth/logout'); // Server blacklists the token
    } catch (err) {
      // Even if the server call fails, we still clear local state
      console.error('Logout API error:', err.message);
    } finally {
      localStorage.removeItem('token');
      set({ user: null, token: null, error: null });
    }
  },

  /**
   * clearError — dismiss the current error message from the UI
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
