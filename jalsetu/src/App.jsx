// src/App.jsx
// Route definitions for the entire application

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage        from './pages/HomePage';
import OrderPage       from './pages/OrderPage';
import OrderStatusPage from './pages/OrderStatusPage';
import AuthPage        from './pages/AuthPage';
import VendorDashboard from './pages/VendorDashboard';
import AdminPanel      from './pages/AdminPanel';
import NotFound        from './pages/NotFound';

// Shared
import LoadingScreen   from './components/shared/LoadingScreen';

// ── Route guards ──────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/auth" replace />;
  if (requiredRole && profile?.role !== requiredRole)
    return <Navigate to="/" replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"      element={<HomePage />} />
      <Route path="/auth"  element={<AuthPage />} />

      {/* ── Customer ── */}
      <Route path="/order"               element={<OrderPage />} />
      <Route path="/order/status/:id"    element={<OrderStatusPage />} />

      {/* ── Vendor (requires vendor role) ── */}
      <Route
        path="/vendor/*"
        element={
          <ProtectedRoute requiredRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Admin ── */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
