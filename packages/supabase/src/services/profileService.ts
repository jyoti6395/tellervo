import type { SupabaseClient, User } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../client';
import type { AuthUser, ProfileRecord } from '../types/auth';

export class ProfileService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = defaultSupabase) {
    this.client = client;
  }

  /**
   * Helper to map a Supabase Auth User and optional profile record to AuthUser
   */
  public mapToAuthUser(supabaseUser: User, profile?: ProfileRecord | null): AuthUser {
    const email = supabaseUser.email || '';
    const name =
      profile?.full_name ||
      (supabaseUser.user_metadata?.full_name as string) ||
      email.split('@')[0] ||
      'Patron';

    // Role Resolution Strategy:
    // 1. Check if user is an administrator via app_metadata, profile role, or Founder Patron tier.
    // 2. Otherwise, use existing saved role from public.profiles table (e.g. 'customer').
    // 3. Fallback to app_metadata role if present.
    // 4. Default to 'customer'.
    let role: string = 'customer';
    if (
      supabaseUser.app_metadata?.role === 'admin' ||
      profile?.role === 'admin' ||
      profile?.tier === 'Founder Patron'
    ) {
      role = 'admin';
    } else if (profile?.role) {
      role = profile.role;
    } else if (supabaseUser.app_metadata?.role) {
      role = supabaseUser.app_metadata.role;
    }

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
      avatarUrl:
        profile?.avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
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
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
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
        avatar_url:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        tier: 'Taiga Patron',
        seeds: 50,
        trees_planted: 18,
        address: 'Mannerheimintie 14 B, Helsinki (Default)',
        payment_method: 'Apple Pay •••• 9012',
        dietary_preferences: 'Low sugar, zero-proof, vegan botanical extracts',
        role: 'customer',
      };

      const { data, error } = await this.client
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
   * Updates an existing profile
   */
  public async updateProfile(userId: string, updates: Partial<ProfileRecord>): Promise<{ success: boolean; data?: ProfileRecord; error?: string }> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('*')
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data as ProfileRecord };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
    }
  }

  /**
   * Fetches all user profiles (for dashboard / admin management)
   */
  public async fetchAllProfiles(): Promise<ProfileRecord[]> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }
      return data as ProfileRecord[];
    } catch {
      return [];
    }
  }
}

export const profileService = new ProfileService();
