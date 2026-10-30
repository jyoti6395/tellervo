import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook encapsulating SPA History API navigation and URL state.
 * Strictly isolates navigation business logic from UI components.
 */
export function useNavigation() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== path) {
      window.history.pushState({ isAppNav: true }, '', path);
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const replace = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    window.history.replaceState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const getRedirectQuery = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    return redirect ? decodeURIComponent(redirect) : null;
  }, []);

  return {
    currentPath,
    navigate,
    replace,
    getRedirectQuery,
  };
}

/**
 * Standalone navigation helper for usage outside React components
 */
export function navigateTo(path: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== path) {
    window.history.pushState({ isAppNav: true }, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}
