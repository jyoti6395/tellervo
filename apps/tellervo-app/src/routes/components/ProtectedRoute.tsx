import React, { useEffect } from 'react';
import { RouteDefinition } from '../routes.config';
import { useRouteGuard } from '../hooks/useRouteGuard';
import { navigateTo } from '../hooks/useNavigation';
import { AuthLoadingScreen } from './AuthLoadingScreen';
import { AccessDenied } from './AccessDenied';

interface ProtectedRouteProps {
  route: RouteDefinition;
  children: React.ReactNode;
}

/**
 * Reusable Protected Route Guard Component
 * Enforces authentication and authorization before rendering protected children.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ route, children }) => {
  const guard = useRouteGuard(route);

  useEffect(() => {
    if (guard.status === 'unauthenticated') {
      navigateTo(guard.redirectPath);
    }
  }, [guard]);

  if (guard.status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (guard.status === 'unauthenticated') {
    return null;
  }

  if (guard.status === 'unauthorized') {
    return <AccessDenied requiredRole={route.requiredRole} />;
  }

  return <>{children}</>;
};
