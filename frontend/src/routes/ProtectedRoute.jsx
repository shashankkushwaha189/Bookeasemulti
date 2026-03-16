import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const map = { SUPER_ADMIN: '/super-admin/dashboard', ADMIN: '/admin/dashboard', STAFF: '/staff/dashboard', CUSTOMER: '/businesses' };

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={map[user.role] || '/login'} replace />;
  return children;
};

export default ProtectedRoute;
