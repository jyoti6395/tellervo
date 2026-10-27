import { APP_ROUTES } from './routes.config';
import { navigateTo } from './hooks/useNavigation';

export const AUTH_ROUTES = {
  SIGNUP: APP_ROUTES.SIGNUP.path,
  LOGIN: APP_ROUTES.LOGIN.path,
  HOME: APP_ROUTES.HOME.path,
} as const;

export type AuthRouteType = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];

export function getCurrentAuthRoute(): 'signup' | 'login' | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');

  if (path === AUTH_ROUTES.SIGNUP) {
    return 'signup';
  }
  if (path === AUTH_ROUTES.LOGIN) {
    return 'login';
  }
  return null;
}

export { navigateTo };
