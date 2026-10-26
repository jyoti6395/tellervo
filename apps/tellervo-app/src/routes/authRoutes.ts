/**
 * Application Authentication & Navigation Routes
 * 
 * Defines standard application authentication routes:
 * - Login: /login
 * - Signup: /signup
 * - Home: /
 * 
 * Supports browser history navigation (pushState / popstate)
 * while preserving SPA responsiveness without external dependencies.
 */

export const AUTH_ROUTES = {
  SIGNUP: '/signup',
  LOGIN: '/login',
  HOME: '/',
} as const;

export type AuthRouteType = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];

/**
 * Normalizes the current pathname to match known auth routes:
 * - /signup -> 'signup'
 * - /login -> 'login'
 */
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

/**
 * Client-side navigation that preserves SPA responsiveness
 * while properly updating window.location.pathname and history.
 */
export function navigateTo(path: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}
