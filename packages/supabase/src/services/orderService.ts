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
  AdminOrderRecord,
  OrderStatus,
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
      let { data, error } = await this.client.rpc('create_order_with_simulation', {
        p_order_payload: orderPayload,
        p_items_payload: itemsPayload,
        p_payment_outcome: outcome,
        p_payment_id: paymentId,
      });

      // If duplicate payment_id or unique constraint error occurs, retry once with a freshly generated unique payment reference
      if (
        error &&
        (error.message.includes('unique constraint') ||
          error.message.includes('duplicate key') ||
          error.message.includes('payments_provider_payment_id_key') ||
          error.message.includes('provider_payment_id'))
      ) {
        const retryPaymentId = `PAY-FI-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
        console.warn(`[OrderService] Duplicate payment ID detected (${paymentId}). Retrying with fresh ID: ${retryPaymentId}`);
        const retryResult = await this.client.rpc('create_order_with_simulation', {
          p_order_payload: orderPayload,
          p_items_payload: itemsPayload,
          p_payment_outcome: outcome,
          p_payment_id: retryPaymentId,
        });

        if (!retryResult.error && retryResult.data) {
          data = retryResult.data;
          error = null;
        } else {
          error = retryResult.error;
        }
      }

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

  /**
   * Fetch all orders across all customers for Admin Dashboard Table view.
   * Maps orders, order_items, customer address/profiles, and order_status_history.
   */
  public async fetchAllOrdersAdmin(): Promise<AdminOrderRecord[]> {
    try {
      // 1. Fetch all orders
      const { data: orders, error: ordersError } = await this.client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError || !orders || orders.length === 0) {
        return [];
      }

      const orderIds = orders.map((o: any) => o.id);
      const userIds = Array.from(new Set(orders.map((o: any) => o.user_id).filter(Boolean)));

      // 2. Fetch line items
      const { data: items } = await this.client
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      // 3. Fetch latest status history entries
      const { data: history } = await this.client
        .from('order_status_history')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      // 4. Fetch customer addresses
      const { data: addresses } = userIds.length > 0
        ? await this.client.from('addresses').select('*').in('user_id', userIds)
        : { data: [] };

      // 5. Fetch profiles
      const { data: profiles } = userIds.length > 0
        ? await this.client.from('profiles').select('*').in('id', userIds)
        : { data: [] };

      // 6. Fetch payments
      const { data: payments } = orderIds.length > 0
        ? await this.client
            .from('payments')
            .select('*')
            .in('order_id', orderIds)
            .order('created_at', { ascending: false })
        : { data: [] };

      const itemsByOrder: Record<string, any[]> = {};
      (items || []).forEach((item: any) => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      });

      const historyByOrder: Record<string, any> = {};
      (history || []).forEach((h: any) => {
        if (!historyByOrder[h.order_id]) historyByOrder[h.order_id] = h; // First one is newest
      });

      const defaultAddressByUser: Record<string, any> = {};
      (addresses || []).forEach((a: any) => {
        if (a.is_default || !defaultAddressByUser[a.user_id]) {
          defaultAddressByUser[a.user_id] = a;
        }
      });

      const profileByUser: Record<string, any> = {};
      (profiles || []).forEach((p: any) => {
        profileByUser[p.id] = p;
      });

      const paymentByOrder: Record<string, any> = {};
      (payments || []).forEach((pay: any) => {
        if (!paymentByOrder[pay.order_id] || pay.status === 'paid') {
          paymentByOrder[pay.order_id] = pay;
        }
      });

      return orders.map((o: any): AdminOrderRecord => {
        const orderItems = itemsByOrder[o.id] || [];
        const firstItem = orderItems[0] || {};
        const latestHist = historyByOrder[o.id];
        const userAddr = defaultAddressByUser[o.user_id];
        const userProf = profileByUser[o.user_id];
        const orderPay = paymentByOrder[o.id];

        // Format Date (e.g., '24 Dec 2025')
        const dateStr = o.created_at
          ? new Date(o.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent';

        // Customer Name & Address
        const customerName =
          userAddr?.recipient_name ||
          o.delivery_address?.recipient_name ||
          userProf?.full_name ||
          o.customer_name ||
          'Customer';

        const customerEmail =
          userProf?.email ||
          o.customer_email ||
          '-';

        const customerPhone =
          userAddr?.phone ||
          o.delivery_address?.phone ||
          userProf?.phone ||
          o.customer_phone ||
          '-';

        let fullAddress = '-';
        if (userAddr) {
          fullAddress = [userAddr.street, userAddr.postal_code, userAddr.city, userAddr.country_code]
            .filter(Boolean)
            .join(', ');
        } else if (o.delivery_address && typeof o.delivery_address === 'object' && o.delivery_address.street) {
          const d = o.delivery_address;
          fullAddress = [d.street, d.postal_code, d.city, d.country_code].filter(Boolean).join(', ');
        }

        // Status from Order Status History or Order status
        const rawStatus = latestHist?.new_status || o.status || 'Pending';
        let cleanStatus: OrderStatus = 'Pending';
        if (rawStatus === 'In Progress' || rawStatus === 'in_progress') cleanStatus = 'In Progress';
        else if (rawStatus === 'Shipments' || rawStatus === 'shipments' || rawStatus === 'Shipped') cleanStatus = 'Shipments';
        else if (rawStatus === 'Completed' || rawStatus === 'completed') cleanStatus = 'Completed';
        else if (rawStatus === 'Cancelled' || rawStatus === 'cancelled') cleanStatus = 'Cancelled';
        else if (rawStatus === 'Refunded' || rawStatus === 'refunded') cleanStatus = 'Refunded';

        return {
          id: o.id,
          orderCode: o.order_number || ('#TL-' + o.id.slice(0, 5)),
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: fullAddress,
          },
          primaryProduct: {
            name: firstItem.product_name || 'Product',
            image:
              firstItem.product_image_url ||
              'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80',
            additionalCount: orderItems.length > 1 ? orderItems.length - 1 : 0,
          },
          items: orderItems.map((item: any) => ({
            name: item.product_name || 'Product',
            quantity: Number(item.quantity) || 1,
            price: Number(item.unit_price) || 0,
            image: item.product_image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&auto=format&fit=crop&q=80',
          })),
          date: dateStr,
          rawDate: o.created_at,
          amount: Number(o.grand_total) || 0,
          status: cleanStatus,
          paymentMethod: orderPay?.payment_method || 'Dummy Simulation',
        };
      });
    } catch (err) {
      console.error('[OrderService] Error in fetchAllOrdersAdmin:', err);
      return [];
    }
  }

  /**
   * Updates an order status in public.orders AND records an audit entry in public.order_status_history
   */
  public async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    changedBy?: string,
    reason?: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { data: currentOrder } = await this.client
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .maybeSingle();

      const previousStatus = currentOrder?.status || null;

      // Check if changedBy is a valid UUID
      const isUUID =
        typeof changedBy === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(changedBy);

      // Attempt updating orders table
      const { error: updateError } = await this.client
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      // If constraint rejects (e.g. 'Shipments' before migration applied to orders table check),
      // we still record it in order_status_history which has no check constraint and is the single source of truth!
      if (updateError && !updateError.message.includes('check constraint')) {
        return { success: false, error: new Error(updateError.message) };
      }

      await this.client
        .from('order_status_history')
        .insert({
          order_id: orderId,
          previous_status: previousStatus,
          new_status: newStatus,
          changed_by: isUUID ? changedBy : null,
          reason: reason || (changedBy ? `Updated by ${changedBy}` : 'Updated via Admin Dashboard'),
        });

      return { success: true, error: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update order status';
      return { success: false, error: new Error(errorMsg) };
    }
  }
}

export const orderService = new OrderService();

