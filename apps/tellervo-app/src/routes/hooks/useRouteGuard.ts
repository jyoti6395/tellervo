import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteDefinition, APP_ROUTES, UserRole } from '../routes.config';
import { useNavigation } from './useNavigation';

export type GuardStatus =
  | { status: 'loading' }
  | { status: 'unauthenticated'; redirectPath: string }
  | { status: 'already-authenticated'; redirectPath: string }
  | { status: 'unauthorized' }
  | { status: 'authorized' };

/**
 * Pure Business Logic Hook for Route Guarding
 * Strictly isolates authentication rules and role checks from UI components.
 */
export function useRouteGuard(route: RouteDefinition): GuardStatus {
  const { isAuthenticated, isLoadingSession, authUser } = useApp();
  const { getRedirectQuery } = useNavigation();

  return useMemo(() => {
    // 1. Session is still initializing/hydrating from Supabase
    if (isLoadingSession) {
      return { status: 'loading' };
    }

    // 2. Protected Route: requires active authenticated session
    if (route.access === 'protected' && (!isAuthenticated || authUser?.status === 'deactive')) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : route.path;
      const redirectParam = encodeURIComponent(currentPath);
      return {
        status: 'unauthenticated',
        redirectPath: `${APP_ROUTES.LOGIN.path}?redirect=${redirectParam}`,
      };
    }

    // 3. Guest-Only Route (Sign In / Sign Up): authenticated users should be redirected
    if (route.access === 'guest-only' && isAuthenticated && authUser?.status !== 'deactive') {
      const redirectQuery = getRedirectQuery();
      return {
        status: 'already-authenticated',
        redirectPath: redirectQuery || APP_ROUTES.HOME.path,
      };
    }

    // 4. Role Authorization: check if user has required role
    if (route.requiredRole && route.requiredRole.length > 0) {
      const userRole = (authUser?.role || 'customer') as UserRole;
      if (!route.requiredRole.includes(userRole)) {
        return { status: 'unauthorized' };
      }
    }

    // 5. Authorized to view route
    return { status: 'authorized' };
  }, [route, isAuthenticated, isLoadingSession, authUser, getRedirectQuery]);
}
