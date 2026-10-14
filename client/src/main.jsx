import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.jsx';
import './styles/index.css';

/**
 * QueryClient handles server-state caching (data fetched from the API).
 * It automatically caches, refetches, and deduplicates your API calls.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays "fresh" for 5 minutes before refetching
      retry: 1,                  // Retry failed requests once
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter enables client-side navigation (React Router) */}
    <BrowserRouter>
      {/* QueryClientProvider makes the query client available to all components */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
