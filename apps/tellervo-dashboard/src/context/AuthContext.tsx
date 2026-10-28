import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, profileService, type AuthUser, type Session, type User } from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  role: 'admin' | 'customer' | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Role Resolver — production priority order:
 * 1. public.profiles.role column (database source of truth)
 * 2. auth.users.app_metadata.role (server-side, cannot be set by client)
 * 3. auth.users.user_metadata.role (set at account creation time)
 * 4. Founder Patron tier fallback
 */
function resolveRole(
  sbUser: User,
  profileRole?: string,
  profileTier?: string
): 'admin' | 'customer' {
  if (profileRole === 'admin') return 'admin';
  if (sbUser.app_metadata?.role === 'admin') return 'admin';
  if (sbUser.user_metadata?.role === 'admin') return 'admin';
  if (profileTier === 'Founder Patron') return 'admin';
  return 'customer';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setSession(null);
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    const sbUser = currentSession.user;

    try {
      const profile = await profileService.fetchUserProfile(sbUser.id);
      const userRole = resolveRole(sbUser, profile?.role, profile?.tier);

      if (userRole !== 'admin') {
        // Non-admin: terminate session silently
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
        return;
      }

      const mappedUser = profileService.mapToAuthUser(sbUser, profile);
      mappedUser.role = 'admin';

      setSession(currentSession);
      setUser(mappedUser);
      setRole('admin');
    } catch {
      // On any failure, clear state to be safe
      setSession(null);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Restore session on mount (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) applySession(session);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) applySession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError || !data.user) {
      return { success: false, error: 'Invalid email or password combination.' };
    }

    const profile = await profileService.fetchUserProfile(data.user.id);
    const userRole = resolveRole(data.user, profile?.role, profile?.tier);

    if (userRole !== 'admin') {
      await supabase.auth.signOut();
      // Return generic error — do not reveal that account exists
      return { success: false, error: 'Invalid email or password combination.' };
    }

    // applySession will be called automatically via onAuthStateChange
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAdmin: role === 'admin',
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
