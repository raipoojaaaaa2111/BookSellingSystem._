import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.jsx';
import useAuthStore from './store/authStore.js';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

/**
 * AppInitializer — runs initAuth once on mount, shows a loader until done.
 *
 * Why this exists:
 *   On page refresh, Zustand loses the `user` object (memory is cleared).
 *   The token is still in localStorage though.
 *   initAuth() calls GET /api/auth/me with that token to restore the user.
 *
 *   isInitialized prevents a flash:
 *   Without it → app renders → no user in state → shows /login briefly
 *               → initAuth finishes → redirects to home (jarring)
 *   With it    → app shows spinner → initAuth finishes → renders correctly
 */
function AppInitializer() {
  const { initAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []); // Runs once on first render only

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3">📚</div>
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppInitializer />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
