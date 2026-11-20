import { Navigate, Outlet } from 'react-router';

import { useAuth } from '../hooks/use-auth';
import { AuthLoading } from './auth-loading';

export function RequireAuth() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AuthLoading />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
