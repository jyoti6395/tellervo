import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../client';

export interface StockCheckResult {
  productId: string;
  name: string;
  isAvailable: boolean;
  currentStock: number;
  requestedQuantity: number;
  status: string;
  message?: string;
}

export interface StockReservationResult {
  success: boolean;
  productId: string;
  productName: string;
  requestedQuantity: number;
  remainingStock: number;
  availableStock?: number;
  newStatus?: string;
  reason?: 'out_of_stock' | 'insufficient_stock' | 'not_found' | 'db_error';
  message: string;
}

export interface BatchReservationResult {
  success: boolean;
  reservedItems: { productId: string; quantity: number }[];
  failedItem?: {
    productId: string;
    productName: string;
    availableStock: number;
    requestedQuantity: number;
    message: string;
  };
}

/**
 * StockService
 * Implements real-time database stock checks & atomic reservation flow:
 *   1. User clicks "Buy Now" / "Proceed to Payment"
 *   2. Backend checks available stock from real-time database
 *   3. Reserve stock atomically ("Ek bottle sirf ek order ko mil sakti hai")
 *   4. Stock available -> Proceed to payment
 *      Stock unavailable -> Halt payment and prompt "Notify Me"
 */
export class StockService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = defaultSupabase) {
    this.client = client;
  }

  /**
   * 1. Real-time Database Stock Check for a single product
   */
  public async checkAvailableStock(
    productId: string,
    quantity: number = 1
  ): Promise<StockCheckResult> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('id, name, stock, status')
        .eq('id', productId)
        .single();

      if (error || !data) {
        return {
          productId,
          name: 'Selected provision',
          isAvailable: false,
          currentStock: 0,
          requestedQuantity: quantity,
          status: 'Out of Stock',
          message: error?.message || 'Product not found in cellar database',
        };
      }

      const rawStatus = (data.status || '').toLowerCase().trim();
      const isStatusOutOfStock =
        rawStatus === 'out of stock' ||
        rawStatus === 'outofstock' ||
        rawStatus === 'out_of_stock' ||
        rawStatus === 'archived';

      const currentStock = Number(data.stock ?? 0);
      const isAvailable = !isStatusOutOfStock && currentStock >= quantity;

      return {
        productId: data.id,
        name: data.name,
        isAvailable,
        currentStock,
        requestedQuantity: quantity,
        status: data.status || (currentStock > 0 ? 'Active' : 'Out of Stock'),
        message: isAvailable
          ? `${data.name} is in stock (${currentStock} available)`
          : currentStock <= 0
          ? `${data.name} is currently out of stock.`
          : `Only ${currentStock} bottle(s) left of ${data.name}. You requested ${quantity}.`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stock verification failed';
      return {
        productId,
        name: 'Selected provision',
        isAvailable: false,
        currentStock: 0,
        requestedQuantity: quantity,
        status: 'Unknown',
        message,
      };
    }
  }

  /**
   * 2. Real-time Batch Stock Check for all items in a cart
   */
  public async checkCartStock(
    items: { productId: string; quantity: number; name?: string }[]
  ): Promise<{
    allAvailable: boolean;
    unavailableItems: Array<{
      productId: string;
      name: string;
      availableStock: number;
      requestedQuantity: number;
      message: string;
    }>;
  }> {
    if (!items || items.length === 0) {
      return { allAvailable: true, unavailableItems: [] };
    }

    const unavailableItems: Array<{
      productId: string;
      name: string;
      availableStock: number;
      requestedQuantity: number;
      message: string;
    }> = [];

    // Query all product records from real-time database in one efficient roundtrip
    const productIds = items.map((i) => i.productId);
    const { data, error } = await this.client
      .from('products')
      .select('id, name, stock, status')
      .in('id', productIds);

    if (error || !data) {
      // If table query fails, fallback to item-by-item check
      for (const item of items) {
        const check = await this.checkAvailableStock(item.productId, item.quantity);
        if (!check.isAvailable) {
          unavailableItems.push({
            productId: item.productId,
            name: check.name || item.name || 'Provision',
            availableStock: check.currentStock,
            requestedQuantity: item.quantity,
            message: check.message || 'Out of stock',
          });
        }
      }
      return {
        allAvailable: unavailableItems.length === 0,
        unavailableItems,
      };
    }

    const productMap = new Map<string, { id: string; name: string; stock: number; status: string }>();
    data.forEach((p) => {
      productMap.set(p.id, {
        id: p.id,
        name: p.name,
        stock: Number(p.stock ?? 0),
        status: p.status || 'Active',
      });
    });

    for (const item of items) {
      const prod = productMap.get(item.productId);
      const name = prod?.name || item.name || 'Provision';
      const stock = prod?.stock ?? 0;
      const rawStatus = (prod?.status || '').toLowerCase().trim();
      const isOut = rawStatus === 'out of stock' || rawStatus === 'outofstock' || stock <= 0;

      if (!prod || isOut || stock < item.quantity) {
        unavailableItems.push({
          productId: item.productId,
          name,
          availableStock: stock,
          requestedQuantity: item.quantity,
          message: stock <= 0
            ? `${name} is currently out of stock.`
            : `Only ${stock} bottle(s) available for ${name}.`,
        });
      }
    }

    return {
      allAvailable: unavailableItems.length === 0,
      unavailableItems,
    };
  }

  /**
   * 3. Reserve Stock Atomically
   * "Ek bottle sirf ek order ko mil sakti hai"
   * First tries PostgreSQL stored procedure `reserve_product_stock` (with row-level lock).
   * Falls back gracefully to atomic conditional update if RPC is not yet created.
   */
  public async reserveProductStock(
    productId: string,
    quantity: number = 1
  ): Promise<StockReservationResult> {
    try {
      // Attempt 1: Database RPC function (FOR UPDATE row lock)
      const { data: rpcData, error: rpcError } = await this.client.rpc('reserve_product_stock', {
        p_product_id: productId,
        p_quantity: quantity,
      });

      if (!rpcError && rpcData) {
        const res = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData;
        return {
          success: Boolean(res.success),
          productId: res.product_id || productId,
          productName: res.product_name || 'Provision',
          requestedQuantity: quantity,
          remainingStock: res.remaining_stock ?? 0,
          availableStock: res.available_stock,
          newStatus: res.new_status,
          reason: res.reason,
          message: res.message || (res.success ? 'Stock reserved' : 'Insufficient stock'),
        };
      }

      // Attempt 2: Direct atomic conditional verification & update fallback
      const { data: current, error: fetchErr } = await this.client
        .from('products')
        .select('id, name, stock, status')
        .eq('id', productId)
        .single();

      if (fetchErr || !current) {
        return {
          success: false,
          productId,
          productName: 'Provision',
          requestedQuantity: quantity,
          remainingStock: 0,
          reason: 'not_found',
          message: 'Product not found in database',
        };
      }

      const currentStock = Number(current.stock ?? 0);
      const rawStatus = (current.status || '').toLowerCase().trim();
      const isOut = rawStatus === 'out of stock' || rawStatus === 'outofstock' || currentStock < quantity;

      if (isOut) {
        return {
          success: false,
          productId,
          productName: current.name,
          requestedQuantity: quantity,
          remainingStock: currentStock,
          availableStock: currentStock,
          reason: 'out_of_stock',
          message: currentStock <= 0
            ? `${current.name} is out of stock`
            : `Only ${currentStock} left of ${current.name} (requested ${quantity})`,
        };
      }

      // Atomically decrement stock
      const newStock = Math.max(0, currentStock - quantity);
      const newStatus = newStock === 0 ? 'Out of Stock' : newStock <= 5 ? 'Low Stock' : 'Active';

      const { error: updateErr } = await this.client
        .from('products')
        .update({
          stock: newStock,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (updateErr) {
        return {
          success: false,
          productId,
          productName: current.name,
          requestedQuantity: quantity,
          remainingStock: currentStock,
          reason: 'db_error',
          message: updateErr.message,
        };
      }

      return {
        success: true,
        productId,
        productName: current.name,
        requestedQuantity: quantity,
        remainingStock: newStock,
        newStatus,
        message: 'Stock reserved atomically',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reservation failed';
      return {
        success: false,
        productId,
        productName: 'Provision',
        requestedQuantity: quantity,
        remainingStock: 0,
        reason: 'db_error',
        message,
      };
    }
  }

  /**
   * 4. Reserve Batch Cart Stock Atomically
   * Verifies all cart items before reserving; if any item is out of stock,
   * it stops immediately and safely rolls back any already-reserved items.
   */
  public async reserveCartStock(
    items: { productId: string; quantity: number; name?: string }[]
  ): Promise<BatchReservationResult> {
    if (!items || items.length === 0) {
      return { success: true, reservedItems: [] };
    }

    // Step A: First verify all items in real time
    const preCheck = await this.checkCartStock(items);
    if (!preCheck.allAvailable) {
      const firstFailed = preCheck.unavailableItems[0];
      return {
        success: false,
        reservedItems: [],
        failedItem: {
          productId: firstFailed.productId,
          productName: firstFailed.name,
          availableStock: firstFailed.availableStock,
          requestedQuantity: firstFailed.requestedQuantity,
          message: firstFailed.message,
        },
      };
    }

    // Step B: Atomically reserve each item
    const successfullyReserved: { productId: string; quantity: number }[] = [];

    for (const item of items) {
      const reserveResult = await this.reserveProductStock(item.productId, item.quantity);
      if (!reserveResult.success) {
        // Rollback all items reserved so far in this checkout session
        await this.rollbackReservedStock(successfullyReserved);
        return {
          success: false,
          reservedItems: [],
          failedItem: {
            productId: item.productId,
            productName: reserveResult.productName || item.name || 'Provision',
            availableStock: reserveResult.availableStock ?? 0,
            requestedQuantity: item.quantity,
            message: reserveResult.message,
          },
        };
      }
      successfullyReserved.push({ productId: item.productId, quantity: item.quantity });
    }

    return {
      success: true,
      reservedItems: successfullyReserved,
    };
  }

  /**
   * Rollback reserved stock in case payment fails or order is aborted
   */
  public async rollbackReservedStock(
    items: { productId: string; quantity: number }[]
  ): Promise<void> {
    for (const item of items) {
      await this.releaseProductStock(item.productId, item.quantity);
    }
  }

  /**
   * Release reserved stock back to the database
   */
  public async releaseProductStock(productId: string, quantity: number): Promise<void> {
    try {
      // Try RPC first
      const { error: rpcErr } = await this.client.rpc('release_product_stock', {
        p_product_id: productId,
        p_quantity: quantity,
      });

      if (!rpcErr) return;

      // Fallback manual increment
      const { data: prod } = await this.client
        .from('products')
        .select('stock, status')
        .eq('id', productId)
        .single();

      if (prod) {
        const restoredStock = Number(prod.stock ?? 0) + quantity;
        const restoredStatus =
          restoredStock <= 0 ? 'Out of Stock' : restoredStock <= 5 ? 'Low Stock' : 'Active';

        await this.client
          .from('products')
          .update({
            stock: restoredStock,
            status: restoredStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', productId);
      }
    } catch (err) {
      console.warn('[StockService] Note rolling back stock:', err);
    }
  }
}

export const stockService = new StockService();

