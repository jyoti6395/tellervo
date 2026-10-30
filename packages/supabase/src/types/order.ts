export type OrderStatus = 'Pending' | 'In Progress' | 'Shipments' | 'Completed' | 'Cancelled' | 'Refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentSimulationOutcome = 'accept' | 'decline' | 'network_error';

export interface OrderAddressSnapshot {
  recipient_name: string;
  phone?: string | null;
  street: string;
  additional_details?: string | null;
  postal_code: string;
  city: string;
  country_code?: string;
  type?: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  currency: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  grand_total: number;
  delivery_address: OrderAddressSnapshot;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_note?: string | null;
  hidden_from_history_at?: string | null;
  history_hidden_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  volume?: string | null;
  sku?: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  product_image_url?: string | null;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  authorized_at?: string | null;
  captured_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistoryRow {
  id: string;
  order_id: string;
  previous_status?: string | null;
  new_status: string;
  changed_by?: string | null;
  reason?: string | null;
  created_at: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_note?: string | null;
  delivery_address: OrderAddressSnapshot;
  subtotal: number;
  discount_total?: number;
  shipping_total?: number;
}

export interface CreateOrderItemPayload {
  product_id?: string | null;
  product_name: string;
  volume?: string | null;
  sku?: string | null;
  unit_price: number;
  quantity: number;
  product_image_url?: string | null;
}

export interface SimulationOrderResult {
  order_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  grand_total: number;
  currency: string;
  payment_id: string;
  created_at: string;
}

export interface UserOrderWithItems extends OrderRow {
  items: OrderItemRow[];
  payments?: PaymentRow[];
}

export interface AdminOrderRecord {
  id: string;
  orderCode: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  primaryProduct: {
    name: string;
    image: string;
    additionalCount: number;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  date: string;
  rawDate: string;
  amount: number;
  status: OrderStatus;
  paymentMethod: string;
}

