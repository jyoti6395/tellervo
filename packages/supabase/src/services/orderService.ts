import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../client';
import type {
  CreateOrderItemPayload,
  CreateOrderPayload,
  OrderItemRow,
  OrderRow,
  PaymentRow,
  PaymentSimulationOutcome,
  SimulationOrderResult,
  UserOrderWithItems,
} from '../types/order';

export class OrderService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = defaultSupabase) {
    this.client = client;
  }

  /**
   * Submits an order and line items atomically using the create_order_with_simulation RPC.
   * Supports 'accept', 'decline', and 'network_error' testing outcomes.
   */
  public async submitOrderWithSimulation(
    orderPayload: CreateOrderPayload,
    itemsPayload: CreateOrderItemPayload[],
    outcome: PaymentSimulationOutcome,
    paymentId: string
  ): Promise<{ data: SimulationOrderResult | null; error: Error | null }> {
    try {
      const { data, error } = await this.client.rpc('create_order_with_simulation', {
        p_order_payload: orderPayload,
        p_items_payload: itemsPayload,
        p_payment_outcome: outcome,
        p_payment_id: paymentId,
      });

      if (error) {
        console.error('[OrderService] RPC create_order_with_simulation error:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as SimulationOrderResult, error: null };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to submit order with simulation';
      console.error('[OrderService] Exception submitting order:', err);
      return { data: null, error: new Error(errorMsg) };
    }
  }

  /**
   * Fetch all non-hidden orders for a patron, ordered newest first, including line item snapshots
   */
  public async fetchUserOrders(
    userId: string
  ): Promise<{ data: UserOrderWithItems[]; error: Error | null }> {
    try {
      if (!userId) {
        return { data: [], error: null };
      }

      // 1. Fetch user orders
      const { data: orders, error: ordersError } = await this.client
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .is('hidden_from_history_at', null)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('[OrderService] Error fetching orders:', ordersError);
        return { data: [], error: new Error(ordersError.message) };
      }

      if (!orders || orders.length === 0) {
        return { data: [], error: null };
      }

      const orderIds = (orders as OrderRow[]).map((o) => o.id);

      // 2. Fetch line items for retrieved orders
      const { data: items, error: itemsError } = await this.client
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('[OrderService] Error fetching order line items:', itemsError);
      }

      const itemsByOrder: Record<string, OrderItemRow[]> = {};
      if (items) {
        for (const item of items as OrderItemRow[]) {
          if (!itemsByOrder[item.order_id]) {
            itemsByOrder[item.order_id] = [];
          }
          itemsByOrder[item.order_id].push(item);
        }
      }

      // 3. Fetch payment references for retrieved orders
      const { data: payments, error: paymentsError } = await this.client
        .from('payments')
        .select('*')
        .in('order_id', orderIds);

      if (paymentsError) {
        console.warn('[OrderService] Warning fetching payments:', paymentsError);
      }

      const paymentsByOrder: Record<string, PaymentRow[]> = {};
      if (payments) {
        for (const payment of payments as PaymentRow[]) {
          if (!paymentsByOrder[payment.order_id]) {
            paymentsByOrder[payment.order_id] = [];
          }
          paymentsByOrder[payment.order_id].push(payment);
        }
      }

      // 4. Combine into complete models
      const combined: UserOrderWithItems[] = (orders as OrderRow[]).map((o) => ({
        ...o,
        items: itemsByOrder[o.id] || [],
        payments: paymentsByOrder[o.id] || [],
      }));

      return { data: combined, error: null };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unknown error loading patron order history';
      console.error('[OrderService] Exception fetching orders:', err);
      return { data: [], error: new Error(errorMsg) };
    }
  }

  /**
   * Fetch a single order with its items and payment record
   */
  public async fetchOrderDetails(
    orderId: string
  ): Promise<{ data: UserOrderWithItems | null; error: Error | null }> {
    try {
      const { data: order, error: orderError } = await this.client
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        return { data: null, error: new Error(orderError.message) };
      }

      const { data: items } = await this.client
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      const { data: payments } = await this.client
        .from('payments')
        .select('*')
        .eq('order_id', orderId);

      return {
        data: {
          ...(order as OrderRow),
          items: (items as OrderItemRow[]) || [],
          payments: (payments as PaymentRow[]) || [],
        },
        error: null,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch order details';
      return { data: null, error: new Error(errorMsg) };
    }
  }

  /**
   * Hide an order from customer history (soft-erasure compliant with Finnish Kirjanpitolaki)
   */
  public async hideOrderFromHistory(
    orderId: string,
    userId: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await this.client
        .from('orders')
        .update({
          hidden_from_history_at: new Date().toISOString(),
          history_hidden_by: userId,
        })
        .eq('id', orderId)
        .eq('user_id', userId);

      if (error) {
        console.error('[OrderService] Error hiding order:', error);
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to hide order from history';
      return { success: false, error: new Error(errorMsg) };
    }
  }
}

export const orderService = new OrderService();

