import { create } from 'zustand';
import api from '../services/api';

/**
 * useAuthStore — Zustand store for authentication state.
 *
 * Holds:
 * - user: the logged-in user's data (or null)
 * - token: the JWT access token
 * - isLoading: whether an auth request is in progress
 * - error: any error message from the last auth attempt
 *
 * Actions (functions that update state):
 * - login, register, logout, clearError
 */
const useAuthStore = create((set) => ({
  // ─── State ──────────────────────────────────────────────────────────────
  user: null,
  token: localStorage.getItem('token') || null, // Restore from storage on page refresh
  isLoading: false,
  error: null,

  // ─── Actions ────────────────────────────────────────────────────────────

  /**
   * login — sends credentials to the server and stores the returned token
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
   * register — creates a new account and logs the user in
   */
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * logout — clears the token and user from state
   */
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  /**
   * clearError — used to dismiss error messages in the UI
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
