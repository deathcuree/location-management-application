import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

type ProtectedRouteProps = {
  children: ReactNode;
  isAllowed?: boolean;
  redirectTo?: string;
  replace?: boolean;
  state?: unknown;
};

export default function ProtectedRoute({
  children,
  isAllowed,
  redirectTo = '/login',
  replace = true,
  state,
}: ProtectedRouteProps) {
  const storeIsAuthed = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  const allowed = typeof isAllowed === 'boolean' ? isAllowed : storeIsAuthed;

  if (!allowed) {
    return <Navigate to={redirectTo} replace={replace} state={state ?? { from: location }} />;
  }
  return <>{children}</>;
}