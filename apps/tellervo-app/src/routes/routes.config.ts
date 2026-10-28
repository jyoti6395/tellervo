import { TabType } from '../types';

export type RouteAccessType = 'public' | 'protected' | 'guest-only';
export type UserRole = 'customer' | 'admin' | 'patron' | string;

export interface RouteDefinition {
  path: string;
  name: string;
  access: RouteAccessType;
  requiredRole?: UserRole[];
  tabEquivalent?: TabType;
  layout: 'store' | 'auth' | 'fullscreen';
  title: string;
}

/**
 * Centralized Route Registry for Tellervo App
 * Single source of truth for all paths, access rules, and metadata.
 */
export const APP_ROUTES = {
  HOME: {
    path: '/',
    name: 'Home',
    access: 'public' as RouteAccessType,
    tabEquivalent: 'home' as TabType,
    layout: 'store' as const,
    title: 'Nordic Elixirs & Botanical Spritzes',
  },
  SHOP: {
    path: '/shop',
    name: 'Shop',
    access: 'public' as RouteAccessType,
    tabEquivalent: 'shop' as TabType,
    layout: 'store' as const,
    title: 'Botanical Store & Cellar Drops',
  },
  REWARDS: {
    path: '/rewards',
    name: 'Rewards',
    access: 'public' as RouteAccessType,
    tabEquivalent: 'rewards' as TabType,
    layout: 'store' as const,
    title: 'Patron Seeds & Harvest Rewards',
  },
  FAVORITES: {
    path: '/favorites',
    name: 'Favorites',
    access: 'public' as RouteAccessType,
    tabEquivalent: 'favorites' as TabType,
    layout: 'store' as const,
    title: 'Saved Cellar Reserves',
  },
  PROFILE: {
    path: '/profile',
    name: 'Profile',
    access: 'protected' as RouteAccessType,
    tabEquivalent: 'profile' as TabType,
    layout: 'store' as const,
    title: 'Patron Account & Membership',
  },
  CHECKOUT: {
    path: '/checkout',
    name: 'Checkout',
    access: 'protected' as RouteAccessType,
    layout: 'store' as const,
    title: 'Boreal Checkout & Delivery',
  },
  LOGIN: {
    path: '/login',
    name: 'Sign In',
    access: 'guest-only' as RouteAccessType,
    layout: 'auth' as const,
    title: 'Sign In to Tellervo',
  },
  SIGNUP: {
    path: '/signup',
    name: 'Create Account',
    access: 'guest-only' as RouteAccessType,
    layout: 'auth' as const,
    title: 'Join the Boreal Cellar',
  },
} satisfies Record<string, RouteDefinition>;

export const ALL_ROUTES: RouteDefinition[] = Object.values(APP_ROUTES);

export type AppRouteKey = keyof typeof APP_ROUTES;
export type AppRoutePath = (typeof APP_ROUTES)[AppRouteKey]['path'];

/**
 * Find route definition by pathname
 */
export function findRouteByPath(pathname: string): RouteDefinition {
  const normalized = pathname.toLowerCase().replace(/\/$/, '') || '/';
  
  const matched = Object.values(APP_ROUTES).find(
    (route) => route.path === normalized
  );

  return matched || APP_ROUTES.HOME;
}
