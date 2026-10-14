import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * If the user isn't logged in, they get redirected to /login.
 */
function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

/**
 * App — the root component. Defines all the routes in the application.
 * As we build more pages (listings, profile, etc.) we'll add them here.
 */
function App() {
  return (
    <Routes>
      {/* Public routes — accessible without logging in */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes — require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect unknown URLs to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
