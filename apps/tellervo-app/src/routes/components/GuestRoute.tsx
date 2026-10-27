import React, { useEffect } from 'react';
import { RouteDefinition } from '../routes.config';
import { useRouteGuard } from '../hooks/useRouteGuard';
import { navigateTo } from '../hooks/useNavigation';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface GuestRouteProps {
  route: RouteDefinition;
  children: React.ReactNode;
}

/**
 * Reusable Guest-Only Route Guard Component
 * Enforces unauthenticated access (e.g. for /login and /signup).
 * Redirects logged-in patrons back to their intended destination or home.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ route, children }) => {
  const guard = useRouteGuard(route);

  useEffect(() => {
    if (guard.status === 'already-authenticated') {
      navigateTo(guard.redirectPath);
    }
  }, [guard]);

  if (guard.status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (guard.status === 'already-authenticated') {
    return null;
  }

  return <>{children}</>;
};
