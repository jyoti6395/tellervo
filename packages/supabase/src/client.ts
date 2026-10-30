import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://alextavpyuifokaoyxkv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_R8hvMUm0wW1QuXtWpTct3w_KyUljPN-';

export interface SupabaseClientOptions {
  url?: string;
  anonKey?: string;
  storageKey?: string;
}

/**
 * Creates a configured Supabase client.
 * Automatically inspects Vite import.meta.env when available,
 * falling back to default configuration.
 */
export function createCustomSupabaseClient(options?: SupabaseClientOptions): SupabaseClient {
  const url =
    options?.url ||
    (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL;

  const anonKey =
    options?.anonKey ||
    (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY) ||
    DEFAULT_SUPABASE_ANON_KEY;

  const isDashboardRuntime =
    typeof window !== 'undefined' &&
    (window.location.port === '5174' ||
      window.location.hostname.includes('dashboard') ||
      window.location.hostname.includes('admin') ||
      window.location.pathname.startsWith('/dashboard') ||
      (typeof document !== 'undefined' && document.title.toLowerCase().includes('dashboard')));

  const storageKey =
    options?.storageKey ||
    (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_STORAGE_KEY) ||
    (isDashboardRuntime ? 'tellervo_dashboard_auth_token' : 'tellervo_app_auth_token');

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey,
    },
  });
}

/**
 * Default singleton Supabase client
 */
export const supabase = createCustomSupabaseClient();
