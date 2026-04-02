import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './routes/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import SuperAdminDashboard  from './pages/super-admin/SuperAdminDashboard';
import SuperAdminBusinesses from './pages/super-admin/SuperAdminBusinesses';
import SuperAdminUsers      from './pages/super-admin/SuperAdminUsers';

import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminServices     from './pages/admin/AdminServices';
import AdminStaff        from './pages/admin/AdminStaff';
import AdminAppointments from './pages/admin/AdminAppointments';

import StaffDashboard from './pages/staff/StaffDashboard';

import BusinessList   from './pages/public/BusinessList';
import BusinessDetail from './pages/public/BusinessDetail';
import MyAppointments from './pages/customer/MyAppointments';

const roleMap = { SUPER_ADMIN: '/super-admin/dashboard', ADMIN: '/admin/dashboard', STAFF: '/staff/dashboard', CUSTOMER: '/businesses' };

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleMap[user.role] || '/businesses'} replace />;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/"         element={<RootRedirect />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/super-admin/dashboard"  element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/super-admin/businesses" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminBusinesses /></ProtectedRoute>} />
        <Route path="/super-admin/users"      element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminUsers /></ProtectedRoute>} />

        <Route path="/admin/dashboard"    element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/services"     element={<ProtectedRoute roles={['ADMIN']}><AdminServices /></ProtectedRoute>} />
        <Route path="/admin/staff"        element={<ProtectedRoute roles={['ADMIN']}><AdminStaff /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute roles={['ADMIN']}><AdminAppointments /></ProtectedRoute>} />

        <Route path="/staff/dashboard" element={<ProtectedRoute roles={['STAFF']}><StaffDashboard /></ProtectedRoute>} />

        <Route path="/businesses"      element={<ProtectedRoute roles={['CUSTOMER']}><BusinessList /></ProtectedRoute>} />
        <Route path="/businesses/:id"  element={<ProtectedRoute roles={['CUSTOMER']}><BusinessDetail /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute roles={['CUSTOMER']}><MyAppointments /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
