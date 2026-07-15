import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_DASHBOARD_PATH } from '../utils/constants';

export default function RoleRoute({ roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!roles.includes(user.role)) {
    return <Navigate to={ROLE_DASHBOARD_PATH[user.role] || '/dashboard'} replace />;
  }

  return <Outlet />;
}
