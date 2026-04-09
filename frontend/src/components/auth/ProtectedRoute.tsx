import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { UserRole } from '../../store/slices/userSlice';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAuth?: boolean;
  requireRoles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireRoles,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing, currentUser } = useAppSelector((state) => state.user);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--c-bg)] text-[color:var(--c-text2)]">
        Laden...
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ message: 'Log in om verder te gaan.', returnTo: location.pathname }}
        replace
      />
    );
  }

  if (requireRoles && requireRoles.length > 0) {
    if (!currentUser?.role || !requireRoles.includes(currentUser.role)) {
      return (
        <Navigate
          to={redirectTo}
          state={{ message: 'Je hebt geen toegang tot deze pagina.' }}
          replace
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;
