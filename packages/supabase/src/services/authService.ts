import type { SupabaseClient, User } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../client';
import type { AuthUser, AuthSession, AuthResult, ProfileRecord } from '../types/auth';
import { profileService, ProfileService } from './profileService';

export class AuthService {
  private client: SupabaseClient;
  private profileService: ProfileService;

  constructor(client: SupabaseClient = defaultSupabase, profileSvc: ProfileService = profileService) {
    this.client = client;
    this.profileService = profileSvc;
  }

  /**
   * Checks whether the Supabase client is initialized with credentials
   */
  public isSupabaseConfigured(): boolean {
    return Boolean(this.client);
  }

  /**
   * Helper to map a Supabase Auth User and optional profile record to AuthUser
   */
  public mapToAuthUser(supabaseUser: User, profile?: ProfileRecord | null): AuthUser {
    return this.profileService.mapToAuthUser(supabaseUser, profile);
  }

  /**
   * Fetches user profile record from public.profiles table
   */
  public async fetchUserProfile(userId: string): Promise<ProfileRecord | null> {
    return this.profileService.fetchUserProfile(userId);
  }

  /**
   * Ensures a profile record exists for the authenticated user
   */
  public async ensureUserProfile(user: User, phone?: string): Promise<ProfileRecord | null> {
    return this.profileService.ensureUserProfile(user, phone);
  }

  /**
   * Restores active authentication session from Supabase
   */
  public async getSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await this.client.auth.getSession();
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
      const { data, error } = await this.client.auth.signInWithPassword({
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
      const { data, error } = await this.client.auth.signUp({
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
      await this.client.auth.signOut();
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
      const { error } = await this.client.auth.resetPasswordForEmail(normalizedEmail);
      if (error) {
        if (
          error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit') ||
          (error as unknown as { code?: string }).code === 'over_email_send_rate_limit'
        ) {
          return {
            success: false,
            error:
              'Password reset rate limit reached. Please wait before requesting another recovery link, or configure custom SMTP in Supabase.',
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
