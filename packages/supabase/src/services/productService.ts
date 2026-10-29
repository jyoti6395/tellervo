import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../client';
import { FavouriteService } from './favouriteService';
import type {
  ProductRecord,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
} from '../types/product';

export class ProductService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = defaultSupabase) {
    this.client = client;
  }

  /**
   * Fetch all products with optional filters, ordered by newest first
   */
  public async fetchProducts(
    filters?: ProductFilters
  ): Promise<{ data: ProductRecord[]; error: Error | null }> {
    try {
      let query = this.client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.volume) {
        if (Array.isArray(filters.volume) && filters.volume.length > 0) {
          query = query.in('volume', filters.volume);
        } else if (typeof filters.volume === 'string' && filters.volume !== 'all') {
          query = query.eq('volume', filters.volume);
        }
      }

      if (filters?.priceRange && filters.priceRange !== 'all') {
        if (filters.priceRange === 'under-100') {
          query = query.or('discount_price.lt.100,original_price.lt.100');
        } else if (filters.priceRange === '100-500') {
          query = query.or('and(discount_price.gte.100,discount_price.lte.500),and(original_price.gte.100,original_price.lte.500)');
        } else if (filters.priceRange === 'under-500') {
          query = query.or('discount_price.lt.500,original_price.lt.500');
        } else if (filters.priceRange === 'above-500') {
          query = query.or('discount_price.gt.500,original_price.gt.500');
        }
      }

      if (filters?.search) {
        const searchVal = `%${filters.search.trim()}%`;
        query = query.or(
          `name.ilike.${searchVal},description.ilike.${searchVal},sku.ilike.${searchVal},category.ilike.${searchVal}`
        );
      }

      if (filters?.offset !== undefined) {
        const lim = filters?.limit || 20;
        query = query.range(filters.offset, filters.offset + lim - 1);
      } else if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[ProductService] Error fetching products:', error);
        return { data: [], error: new Error(error.message) };
      }

      return { data: (data as ProductRecord[]) || [], error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching products';
      console.error('[ProductService] Exception fetching products:', err);
      return { data: [], error: new Error(errorMsg) };
    }
  }

  /**
   * Fetch a single product by ID
   */
  public async fetchProductById(
    id: string
  ): Promise<{ data: ProductRecord | null; error: Error | null }> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('[ProductService] Error fetching product by ID:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data as ProductRecord) || null, error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching product';
      return { data: null, error: new Error(errorMsg) };
    }
  }

  /**
   * Create a new product.
   * Only the actual fields provided in the Add Product UI are saved.
   * Row Level Security ensures only authenticated admins can insert.
   * `created_by` is verified and bound to the authenticated admin's ID.
   */
  public async createProduct(
    input: CreateProductInput
  ): Promise<{ data: ProductRecord | null; error: Error | null }> {
    try {
      // Get current authenticated user
      const { data: userData, error: userError } = await this.client.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: new Error('Authentication required. Only logged-in administrators can create products.'),
        };
      }

      const payload = {
        name: input.name.trim(),
        category: input.category,
        volume: input.volume?.trim() || '330 ml',
        original_price: Number(input.original_price ?? input.price ?? 0),
        discount_price: input.discount_price != null ? Number(input.discount_price) : null,

        stock: Number(input.stock) || 0,
        status: input.status || 'Active',
        description: input.description?.trim() || '',
        images: Array.isArray(input.images) ? input.images.map((img) => img.trim()).filter(Boolean) : (input.image_url?.trim() ? [input.image_url.trim()] : []),

        badge: input.badge ?? null,
        badge_type: input.badge_type ?? null,
        is_featured: Boolean(input.is_featured),
        is_most_selling: Boolean(input.is_most_selling ?? input.most_selling),
        flavor_profile: input.flavor_profile ?? null,
        sku: input.sku?.trim() || `TEL-${Date.now().toString().slice(-6)}`,
        created_by: userData.user.id,
        updated_by: userData.user.id,
      };

      const { data, error } = await this.client
        .from('products')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('[ProductService] Error creating product:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as ProductRecord, error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create product';
      console.error('[ProductService] Exception creating product:', err);
      return { data: null, error: new Error(errorMsg) };
    }
  }

  /**
   * Update an existing product by ID.
   * Row Level Security ensures only authenticated admins can update.
   */
  public async updateProduct(
    id: string,
    updates: UpdateProductInput
  ): Promise<{ data: ProductRecord | null; error: Error | null }> {
    try {
      const { data: userData } = await this.client.auth.getUser();

      const payload: Record<string, unknown> = {
        ...updates,
      };

      if (updates.is_most_selling !== undefined || updates.most_selling !== undefined) {
        payload.is_most_selling = Boolean(updates.is_most_selling ?? updates.most_selling);
      }

      // Convert legacy price and image_url to modern columns and remove them from payload
      if (updates.price !== undefined && updates.original_price === undefined) {
        payload.original_price = updates.price;
      }
      delete (payload as Record<string, unknown>).price;

      if (updates.image_url !== undefined && !updates.images) {
        payload.images = [updates.image_url];
      }
      delete (payload as Record<string, unknown>).image_url;

      if (userData?.user?.id) {
        payload.updated_by = userData.user.id;
      }

      const { data, error } = await this.client
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[ProductService] Error updating product:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as ProductRecord, error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update product';
      console.error('[ProductService] Exception updating product:', err);
      return { data: null, error: new Error(errorMsg) };
    }
  }

  /**
   * Delete a single product by ID.
   * Verifies authenticated admin session before executing.
   * Row Level Security enforces that only admins can delete.
   */
  public async deleteProduct(id: string): Promise<{ error: Error | null }> {
    try {
      if (!id) {
        return { error: new Error('Product ID is required for deletion.') };
      }

      const { data: userData, error: userError } = await this.client.auth.getUser();
      if (userError || !userData?.user) {
        return {
          error: new Error('Authentication required. Only logged-in administrators can delete products.'),
        };
      }

      const { error } = await this.client
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[ProductService] Error deleting product:', error);
        return { error: new Error(error.message) };
      }

      // Clean up deleted product ID from all users' favourite collections
      try {
        const favService = new FavouriteService(this.client);
        await favService.removeIdFromAllFavorites(id);
      } catch (favErr) {
        console.warn('[ProductService] Warning during favourite cleanup after deletion:', favErr);
      }

      return { error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete product';
      console.error('[ProductService] Exception deleting product:', err);
      return { error: new Error(errorMsg) };
    }
  }

  /**
   * Delete multiple products by IDs (bulk deletion).
   * Verifies authenticated admin session before executing.
   */
  public async deleteProducts(ids: string[]): Promise<{ error: Error | null }> {
    try {
      if (!ids || ids.length === 0) {
        return { error: null };
      }

      const { data: userData, error: userError } = await this.client.auth.getUser();
      if (userError || !userData?.user) {
        return {
          error: new Error('Authentication required. Only logged-in administrators can delete products.'),
        };
      }

      const { error } = await this.client
        .from('products')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('[ProductService] Error deleting multiple products:', error);
        return { error: new Error(error.message) };
      }

      // Clean up deleted product IDs from all users' favourite collections
      try {
        const favService = new FavouriteService(this.client);
        await favService.removeIdFromAllFavorites(ids);
      } catch (favErr) {
        console.warn('[ProductService] Warning during favourite cleanup after bulk deletion:', favErr);
      }

      return { error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete products';
      console.error('[ProductService] Exception deleting products:', err);
      return { error: new Error(errorMsg) };
    }
  }

  /**
   * Uploads a product image to Supabase Storage 'product-images' bucket
   * Returns the public CDN URL.
   */
  public async uploadProductImage(
    file: File
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeBytes) {
        return { url: null, error: new Error('Image file exceeds the 5MB size limit.') };
      }

      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
      if (!allowedMimeTypes.includes(file.type)) {
        return { url: null, error: new Error('Invalid image format. Allowed: JPG, PNG, WEBP, SVG.') };
      }

      // Generate sanitized unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `catalog/${cleanFileName}`;

      const { error: uploadError } = await this.client.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('[ProductService] Storage upload error:', uploadError);
        return { url: null, error: new Error(uploadError.message) };
      }

      // Retrieve public URL
      const { data } = this.client.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return { url: data.publicUrl, error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Image upload failed';
      console.error('[ProductService] Exception uploading product image:', err);
      return { url: null, error: new Error(errorMsg) };
    }
  }
  /**
   * Fetches all unique categories and packaging vessels (volumes) from products in database
   */
  public async fetchDistinctFilterOptions(): Promise<{
    categories: string[];
    volumes: string[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('category, volume');

      if (error) {
        console.error('[ProductService] Error fetching distinct filter options:', error);
        return { categories: [], volumes: [], error: new Error(error.message) };
      }

      const raw = data || [];
      const categories = Array.from(
        new Set(raw.map((p: any) => (p.category || '').trim()).filter(Boolean))
      ).sort((a: string, b: string) => a.localeCompare(b));

      const volumes = Array.from(
        new Set(raw.map((p: any) => (p.volume || '').trim()).filter(Boolean))
      ).sort((a: string, b: string) => a.localeCompare(b));

      return { categories, volumes, error: null };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unknown error fetching filter options';
      return { categories: [], volumes: [], error: new Error(errorMsg) };
    }
  }
}

export const productService = new ProductService();
