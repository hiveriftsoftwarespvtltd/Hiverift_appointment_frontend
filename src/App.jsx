import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedAdminRoute from './components/common/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';

import BookingPage from './pages/customer/BookingPage';
import ConfirmationPage from './pages/customer/ConfirmationPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminWorkingHours from './pages/admin/AdminWorkingHours';
import AdminMeetingTypes from './pages/admin/AdminMeetingTypes';
import AdminBlockedTimes from './pages/admin/AdminBlockedTimes';

import { useAuth } from './context/AuthContext';

const CustomerLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-ivory text-charcoal font-sans pt-16">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const AdminRedirect = () => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return admin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/admin/login" replace />;
};

const AdminRedirectLogin = () => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />;
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Customer Routes with Customer Header & Footer */}
          <Route
            path="/"
            element={
              <CustomerLayout>
                <BookingPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/appointment"
            element={
              <CustomerLayout>
                <BookingPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/appointment/confirmation/:id"
            element={
              <CustomerLayout>
                <ConfirmationPage />
              </CustomerLayout>
            }
          />

          {/* Admin Public Login Routes */}
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/login" element={<AdminRedirectLogin />} />

          {/* Admin Protected Routes with Left Sidebar Layout */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminAppointments />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/working-hours"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminWorkingHours />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/meeting-types"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminMeetingTypes />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/blocked-times"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminBlockedTimes />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
