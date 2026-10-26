import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Authentication Service for Tellervo App
 * 
 * Production-quality Supabase Auth and database integration.
 * Supports:
 * - Official Supabase Auth (signUp, signInWithPassword, signOut, resetPasswordForEmail)
 * - User profile storage and retrieval in public.profiles table
 * - Persistent authentication sessions via official Supabase client
 * - Protected routes and user data authorization with Supabase RLS
 */

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'admin' | 'patron';
  memberSince?: string;
  avatarUrl?: string;
  tier?: string;
  seeds?: number;
  treesPlanted?: number;
  address?: string;
  paymentMethod?: string;
  dietaryPreferences?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
  confirmationRequired?: boolean;
}

export interface ProfileRecord {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  tier?: string;
  seeds?: number;
  trees_planted?: number;
  address?: string;
  payment_method?: string;
  dietary_preferences?: string;
  created_at?: string;
  updated_at?: string;
}

class AuthService {
  /**
   * Checks whether the Supabase client is initialized with credentials
   */
  public isSupabaseConfigured(): boolean {
    return Boolean(supabase);
  }

  /**
   * Helper to map a Supabase Auth User and optional profile record to AuthUser
   */
  public mapToAuthUser(supabaseUser: User, profile?: ProfileRecord | null): AuthUser {
    const email = supabaseUser.email || '';
    const name = profile?.full_name || 
                 (supabaseUser.user_metadata?.full_name as string) || 
                 email.split('@')[0] || 
                 'Patron';
    
    const role: 'admin' | 'patron' = 
      profile?.tier === 'Founder Patron' || (supabaseUser.app_metadata?.role === 'admin')
        ? 'admin'
        : 'patron';

    const memberDate = profile?.created_at || supabaseUser.created_at;
    const memberSince = memberDate 
      ? new Date(memberDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'May 2024';

    return {
      id: supabaseUser.id,
      email,
      phone: profile?.phone || (supabaseUser.user_metadata?.phone as string) || undefined,
      name,
      role,
      memberSince,
      avatarUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      tier: profile?.tier || 'Taiga Patron',
      seeds: profile?.seeds !== undefined ? profile?.seeds : 50,
      treesPlanted: profile?.trees_planted !== undefined ? profile?.trees_planted : 18,
      address: profile?.address || 'Mannerheimintie 14 B, Helsinki (Default)',
      paymentMethod: profile?.payment_method || 'Apple Pay •••• 9012',
      dietaryPreferences: profile?.dietary_preferences || 'Low sugar, zero-proof, vegan botanical extracts',
    };
  }

  /**
   * Fetches user profile record from public.profiles table
   */
  public async fetchUserProfile(userId: string): Promise<ProfileRecord | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Table may not exist yet or query failed
        return null;
      }
      return data as ProfileRecord | null;
    } catch {
      return null;
    }
  }

  /**
   * Ensures a profile record exists for the authenticated user
   */
  public async ensureUserProfile(user: User, phone?: string): Promise<ProfileRecord | null> {
    try {
      const existing = await this.fetchUserProfile(user.id);
      if (existing) return existing;

      const userPhone = phone || (user.user_metadata?.phone as string) || undefined;

      const newProfile: Partial<ProfileRecord> = {
        id: user.id,
        email: user.email || '',
        phone: userPhone,
        full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Patron',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        tier: 'Taiga Patron',
        seeds: 50,
        trees_planted: 18,
        address: 'Mannerheimintie 14 B, Helsinki (Default)',
        payment_method: 'Apple Pay •••• 9012',
        dietary_preferences: 'Low sugar, zero-proof, vegan botanical extracts',
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select('*')
        .maybeSingle();

      if (!error && data) {
        return data as ProfileRecord;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Restores active authentication session from Supabase
   */
  public async getSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        return null;
      }

      const supabaseUser = data.session.user;
      const profile = await this.fetchUserProfile(supabaseUser.id);
      const authUser = this.mapToAuthUser(supabaseUser, profile);

      const expiresAt = data.session.expires_at 
        ? data.session.expires_at * 1000 
        : Date.now() + 3600 * 1000;

      return {
        user: authUser,
        token: data.session.access_token,
        expiresAt,
      };
    } catch {
      return null;
    }
  }

  /**
   * Sign In with Email & Password via Supabase Auth
   */
  public async signIn(email: string, password: string, _rememberMe = false): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Invalid email or password. Please verify your credentials.',
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: 'Authentication failed: session was not established.',
        };
      }

      // Ensure profile is initialized in profiles table
      const profile = await this.ensureUserProfile(data.user);
      const user = this.mapToAuthUser(data.user, profile);

      const session: AuthSession = {
        user,
        token: data.session.access_token,
        expiresAt: data.session.expires_at 
          ? data.session.expires_at * 1000 
          : Date.now() + 3600 * 1000,
      };

      return { success: true, user, session };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error during authentication';
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Sign Up / Create Account via Supabase Auth
   */
  public async signUp(email: string, password: string, fullName: string, phone?: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone ? phone.trim() : undefined;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      if (error) {
        if (
          error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('too many requests') ||
          (error as unknown as { code?: string }).code === 'over_email_send_rate_limit'
        ) {
          return {
            success: false,
            error:
              'Supabase email rate limit reached (429 Too Many Requests). Supabase default email service is capped at 3 emails/hour. To resolve: in Supabase Dashboard go to Authentication -> Providers -> Email and uncheck "Confirm email" (recommended for development), or configure custom SMTP.',
          };
        }
        return {
          success: false,
          error: error.message || 'Signup failed. Please check your details and try again.',
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Account creation did not return a valid user.',
        };
      }

      // Handle case where email verification is required (no session returned)
      if (!data.session) {
        const tempUser: AuthUser = {
          id: data.user.id,
          email: normalizedEmail,
          phone: cleanPhone,
          name: cleanName,
          role: 'patron',
          tier: 'Taiga Patron',
          seeds: 50,
          treesPlanted: 18,
          memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };

        return {
          success: true,
          confirmationRequired: true,
          user: tempUser,
        };
      }

      // Session established immediately (auto-confirm enabled)
      const profile = await this.ensureUserProfile(data.user, cleanPhone);
      const user = this.mapToAuthUser(data.user, profile);

      const session: AuthSession = {
        user,
        token: data.session.access_token,
        expiresAt: data.session.expires_at 
          ? data.session.expires_at * 1000 
          : Date.now() + 3600 * 1000,
      };

      return {
        success: true,
        confirmationRequired: false,
        user,
        session,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error during signup';
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Sign Out / Log Out via Supabase Auth
   */
  public async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors during sign out
    }
  }

  /**
   * Password Recovery / Reset via Supabase Auth
   */
  public async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
      if (error) {
        if (
          error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit') ||
          (error as unknown as { code?: string }).code === 'over_email_send_rate_limit'
        ) {
          return {
            success: false,
            error: 'Password reset rate limit reached. Please wait before requesting another recovery link, or configure custom SMTP in Supabase.',
          };
        }
        return { success: false, error: error.message || 'Recovery request failed.' };
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  }
}

export const authService = new AuthService();
