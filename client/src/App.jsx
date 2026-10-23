import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import BrowsePage from './pages/listings/BrowsePage';
import CreateListingPage from './pages/listings/CreateListingPage';
import ListingDetailPage from './pages/listings/ListingDetailPage';
import EditListingPage from './pages/listings/EditListingPage';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 *
 * IMPORTANT: We also check isInitialized here.
 * Without it, on page refresh this is what happens:
 *   1. App loads — token is in localStorage but user is null in Zustand
 *   2. isInitialized = false (initAuth hasn't run yet)
 *   3. ProtectedRoute sees token = null → redirects to /login  ← wrong!
 *   4. initAuth finishes, user is restored — but we're already on /login
 *
 * With isInitialized check:
 *   1. App loads — isInitialized = false
 *   2. ProtectedRoute renders nothing (returns null) while we wait
 *   3. initAuth finishes, isInitialized = true
 *   4. Now we check token — user is logged in → show the page correctly
 */
function ProtectedRoute({ children }) {
  const { token, isInitialized } = useAuthStore();

  // Still loading — don't redirect yet, just render nothing
  if (!isInitialized) return null;

  // Initialized and no token — send to login
  if (!token) return <Navigate to="/login" replace />;

  // All good — show the protected page
  return children;
}

function App() {
  return (
    <Routes>
      {/* ── Public routes ──────────────────────────────────── */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/browse"   element={<BrowsePage />} />

      {/*
        IMPORTANT ROUTE ORDER — specific routes MUST come before dynamic ones.

        React Router matches routes top to bottom.
        If /listings/:id comes first, then /listings/new would match
        with :id = "new" and try to load a listing with id "new" — wrong!

        Correct order:
          /listings/new        ← specific, must be first
          /listings/:id/edit   ← specific, must be before /:id
          /listings/:id        ← dynamic, catches everything else
      */}
      <Route
        path="/listings/new"
        element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>}
      />
      <Route
        path="/listings/:id/edit"
        element={<ProtectedRoute><EditListingPage /></ProtectedRoute>}
      />
      <Route path="/listings/:id" element={<ListingDetailPage />} />

      {/* ── Protected routes ───────────────────────────────── */}
      <Route path="/"             element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
