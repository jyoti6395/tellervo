import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../client';
import type { ProductRecord } from '../types/product';
import type { FavouriteRecord } from '../types/favourite';

export class FavouriteService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = defaultSupabase) {
    this.client = client;
  }

  /**
   * Fetches the array of order/product IDs saved by the user
   */
  public async getFavoriteIds(
    userId: string
  ): Promise<{ data: string[]; error: Error | null }> {
    try {
      if (!userId) {
        return { data: [], error: null };
      }

      const { data, error } = await this.client
        .from('favourite')
        .select('order_ids')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // If table doesn't exist yet, return empty list gracefully
        console.warn('[FavouriteService] Error querying favourite table:', error.message);
        return { data: [], error: new Error(error.message) };
      }

      const ids = (data as Pick<FavouriteRecord, 'order_ids'> | null)?.order_ids || [];
      return { data: Array.isArray(ids) ? ids : [], error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error loading favorites';
      return { data: [], error: new Error(msg) };
    }
  }

  /**
   * Fetches the full populated product records for the user's saved order/product IDs
   */
  public async getPopulatedFavorites(
    userId: string
  ): Promise<{ data: ProductRecord[]; error: Error | null }> {
    try {
      const { data: ids, error: idErr } = await this.getFavoriteIds(userId);
      if (idErr && !ids.length) {
        return { data: [], error: idErr };
      }

      if (!ids || ids.length === 0) {
        return { data: [], error: null };
      }

      const { data: products, error: prodErr } = await this.client
        .from('products')
        .select('*')
        .in('id', ids);

      if (prodErr) {
        console.error('[FavouriteService] Error populating products:', prodErr);
        return { data: [], error: new Error(prodErr.message) };
      }

      return { data: (products as ProductRecord[]) || [], error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error populating favorites';
      return { data: [], error: new Error(msg) };
    }
  }

  /**
   * Saves the entire list of favorite IDs for a user
   */
  public async setFavoriteIds(
    userId: string,
    orderIds: string[]
  ): Promise<{ data: string[]; error: Error | null }> {
    try {
      if (!userId) {
        return { data: orderIds, error: null };
      }

      const uniqueIds = Array.from(new Set(orderIds));

      const { error } = await this.client
        .from('favourite')
        .upsert(
          {
            user_id: userId,
            order_ids: uniqueIds,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('[FavouriteService] Error upserting favourite:', error);
        return { data: orderIds, error: new Error(error.message) };
      }

      return { data: uniqueIds, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error saving favorites';
      return { data: orderIds, error: new Error(msg) };
    }
  }

  /**
   * Toggles an order/product ID in the user's favorites
   */
  public async toggleFavorite(
    userId: string,
    targetId: string
  ): Promise<{ data: string[]; isFavorite: boolean; error: Error | null }> {
    try {
      const { data: currentIds } = await this.getFavoriteIds(userId);
      const exists = currentIds.includes(targetId);

      const nextIds = exists
        ? currentIds.filter(id => id !== targetId)
        : [...currentIds, targetId];

      const res = await this.setFavoriteIds(userId, nextIds);
      return {
        data: res.data,
        isFavorite: !exists,
        error: res.error,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error toggling favorite';
      return { data: [], isFavorite: false, error: new Error(msg) };
    }
  }

  /**
   * Removes one or more order/product IDs from ALL users' favourite collections.
   * Ensures that when an admin deletes a product or order, no orphaned schema IDs remain
   * in any user's favourite list across the entire database.
   */
  public async removeIdFromAllFavorites(
    targetIds: string | string[]
  ): Promise<{ error: Error | null; affectedCount: number }> {
    try {
      const idsToRemove = (Array.isArray(targetIds) ? targetIds : [targetIds]).filter(Boolean);
      if (idsToRemove.length === 0) {
        return { error: null, affectedCount: 0 };
      }

      // 1. First, attempt to call the RPC function if it exists in the database
      try {
        const { error: rpcErr } = await this.client.rpc('remove_deleted_ids_from_favourites', {
          target_ids: idsToRemove,
        });
        if (!rpcErr) {
          return { error: null, affectedCount: idsToRemove.length };
        }
      } catch {
        // RPC might not be created yet, proceed to table-level fallback
      }

      // 2. Fallback: Query all rows in the favourite table
      const { data: rows, error: fetchErr } = await this.client
        .from('favourite')
        .select('user_id, order_ids');

      if (fetchErr) {
        console.error('[FavouriteService] Error querying favourite table during cleanup:', fetchErr);
        return { error: new Error(fetchErr.message), affectedCount: 0 };
      }

      if (!rows || rows.length === 0) {
        return { error: null, affectedCount: 0 };
      }

      const idSet = new Set(idsToRemove);
      const affectedRows = rows.filter(
        (row: Pick<FavouriteRecord, 'user_id' | 'order_ids'>) =>
          Array.isArray(row.order_ids) && row.order_ids.some((id: string) => idSet.has(id))
      );

      if (affectedRows.length === 0) {
        return { error: null, affectedCount: 0 };
      }

      let errorCount = 0;
      await Promise.all(
        affectedRows.map(async (row) => {
          const nextOrderIds = (row.order_ids || []).filter((id: string) => !idSet.has(id));
          const { error: updateErr } = await this.client
            .from('favourite')
            .update({
              order_ids: nextOrderIds,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', row.user_id);

          if (updateErr) {
            console.error(`[FavouriteService] Failed to clean favorites for user ${row.user_id}:`, updateErr.message);
            errorCount++;
          }
        })
      );

      return {
        error: errorCount > 0 ? new Error(`Failed to clean favorites for ${errorCount} users`) : null,
        affectedCount: affectedRows.length - errorCount,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error cleaning favorites';
      console.error('[FavouriteService] Exception in removeIdFromAllFavorites:', err);
      return { error: new Error(msg), affectedCount: 0 };
    }
  }
}

export const favouriteService = new FavouriteService();

