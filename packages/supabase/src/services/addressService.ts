import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../client';
import type {
  AddressRecord,
  CreateAddressInput,
  UpdateAddressInput,
} from '../types/address';

export class AddressService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = defaultSupabase) {
    this.client = client;
  }

  /**
   * Fetch all delivery addresses for a customer, ordered by default first, then newest
   */
  public async fetchAddresses(
    userId?: string
  ): Promise<{ data: AddressRecord[]; error: Error | null }> {
    try {
      let query = this.client
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[AddressService] Note fetching addresses (table may need migration):', error.message);
        return { data: [], error: new Error(error.message) };
      }

      return { data: (data as AddressRecord[]) || [], error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching addresses');
      return { data: [], error };
    }
  }

  /**
   * Create a new delivery address.
   * If user has 0 addresses, this first address automatically becomes the default address.
   * Automatically updates public.profiles.address when default is set.
   */
  public async createAddress(
    input: CreateAddressInput,
    userId?: string
  ): Promise<{ data: AddressRecord | null; error: Error | null }> {
    try {
      let activeUserId = userId;
      if (!activeUserId) {
        const { data: authData } = await this.client.auth.getUser();
        activeUserId = authData?.user?.id;
      }

      if (!activeUserId) {
        return { data: null, error: new Error('User must be authenticated to save an address') };
      }

      // Check if user already has saved addresses. If count is 0, first address MUST be default!
      let isFirstAddress = false;
      try {
        const { count } = await this.client
          .from('addresses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', activeUserId);
        isFirstAddress = count === 0;
      } catch {
        // If table doesn't exist yet or query fails, respect input.is_default
      }

      const willBeDefault = isFirstAddress || Boolean(input.is_default);

      // If this address is default, unset any existing default addresses for this user
      if (willBeDefault) {
        try {
          await this.client
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', activeUserId);
        } catch {
          // ignore
        }
      }

      const newAddress = {
        user_id: activeUserId,
        recipient_name: input.recipient_name.trim(),
        phone: input.phone?.trim() || null,
        type: input.type || 'home',
        title: input.title?.trim() || null,
        street: input.street.trim(),
        additional_details: input.additional_details?.trim() || null,
        postal_code: input.postal_code.trim(),
        city: input.city.trim(),
        country_code: input.country_code?.trim() || 'FI',
        is_default: willBeDefault,
      };

      const { data, error } = await this.client
        .from('addresses')
        .insert(newAddress)
        .select('*')
        .single();

      if (error) {
        console.error('[AddressService] Error creating address in Supabase:', error);
        return { data: null, error: new Error(error.message) };
      }

      // If default, also mirror the formatted address string to public.profiles.address
      if (willBeDefault) {
        const fullAddressStr = `${newAddress.street}, ${newAddress.postal_code} ${newAddress.city} (Default)`;
        try {
          await this.client
            .from('profiles')
            .update({ address: fullAddressStr, updated_at: new Date().toISOString() })
            .eq('id', activeUserId);
        } catch (profileErr) {
          console.warn('[AddressService] Could not sync profiles.address:', profileErr);
        }
      }

      return { data: data as AddressRecord, error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error creating address');
      return { data: null, error };
    }
  }

  /**
   * Update an existing address
   */
  public async updateAddress(
    addressId: string,
    input: UpdateAddressInput,
    userId?: string
  ): Promise<{ data: AddressRecord | null; error: Error | null }> {
    try {
      let activeUserId = userId;
      if (!activeUserId) {
        const { data: authData } = await this.client.auth.getUser();
        activeUserId = authData?.user?.id;
      }

      if (input.is_default && activeUserId) {
        try {
          await this.client
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', activeUserId);
        } catch {
          // ignore
        }
      }

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.recipient_name !== undefined) updates.recipient_name = input.recipient_name.trim();
      if (input.phone !== undefined) updates.phone = input.phone?.trim() || null;
      if (input.type !== undefined) updates.type = input.type;
      if (input.title !== undefined) updates.title = input.title?.trim() || null;
      if (input.street !== undefined) updates.street = input.street.trim();
      if (input.additional_details !== undefined) updates.additional_details = input.additional_details?.trim() || null;
      if (input.postal_code !== undefined) updates.postal_code = input.postal_code.trim();
      if (input.city !== undefined) updates.city = input.city.trim();
      if (input.country_code !== undefined) updates.country_code = input.country_code.trim();
      if (input.is_default !== undefined) updates.is_default = input.is_default;

      const { data, error } = await this.client
        .from('addresses')
        .update(updates)
        .eq('id', addressId)
        .select('*')
        .single();

      if (error) {
        console.error('[AddressService] Error updating address:', error);
        return { data: null, error: new Error(error.message) };
      }

      // If marked default, sync with public.profiles
      if (input.is_default && activeUserId && data) {
        const addr = data as AddressRecord;
        const fullAddressStr = `${addr.street}, ${addr.postal_code} ${addr.city} (Default)`;
        try {
          await this.client
            .from('profiles')
            .update({ address: fullAddressStr, updated_at: new Date().toISOString() })
            .eq('id', activeUserId);
        } catch {
          // ignore
        }
      }

      return { data: data as AddressRecord, error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error updating address');
      return { data: null, error };
    }
  }

  /**
   * Set a specific address as default for the user
   */
  public async setDefaultAddress(
    addressId: string,
    userId?: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      let activeUserId = userId;
      if (!activeUserId) {
        const { data: authData } = await this.client.auth.getUser();
        activeUserId = authData?.user?.id;
      }

      if (!activeUserId) {
        return { success: false, error: new Error('User must be authenticated') };
      }

      // Step 1: Unset default on all addresses for this user
      await this.client
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', activeUserId);

      // Step 2: Set target address as default
      const { data, error } = await this.client
        .from('addresses')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', addressId)
        .eq('user_id', activeUserId)
        .select('*')
        .single();

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      // Step 3: Mirror to public.profiles.address
      if (data) {
        const addr = data as AddressRecord;
        const fullAddressStr = `${addr.street}, ${addr.postal_code} ${addr.city} (Default)`;
        try {
          await this.client
            .from('profiles')
            .update({ address: fullAddressStr, updated_at: new Date().toISOString() })
            .eq('id', activeUserId);
        } catch {
          // ignore
        }
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error setting default address');
      return { success: false, error };
    }
  }

  /**
   * Delete an address
   */
  public async deleteAddress(
    addressId: string,
    userId?: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      let activeUserId = userId;
      if (!activeUserId) {
        const { data: authData } = await this.client.auth.getUser();
        activeUserId = authData?.user?.id;
      }

      // Check if target was default
      const { data: targetAddr } = await this.client
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single();

      const { error } = await this.client
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('[AddressService] Error deleting address:', error);
        return { success: false, error: new Error(error.message) };
      }

      // If deleted address was default, promote next remaining address to default
      if (targetAddr?.is_default && activeUserId) {
        const { data: remaining } = await this.client
          .from('addresses')
          .select('*')
          .eq('user_id', activeUserId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (remaining && remaining.length > 0) {
          const nextDefault = remaining[0] as AddressRecord;
          await this.setDefaultAddress(nextDefault.id, activeUserId);
        } else {
          // No addresses left, clear profiles.address
          try {
            await this.client
              .from('profiles')
              .update({ address: null, updated_at: new Date().toISOString() })
              .eq('id', activeUserId);
          } catch {
            // ignore
          }
        }
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error deleting address');
      return { success: false, error };
    }
  }
}

export const addressService = new AddressService();
