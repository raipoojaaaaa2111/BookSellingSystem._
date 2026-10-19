import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BrowsePage from './pages/listings/BrowsePage';
import CreateListingPage from './pages/listings/CreateListingPage';
import ListingDetailPage from './pages/listings/ListingDetailPage';

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />

      {/* Protected */}
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/listings/new" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
