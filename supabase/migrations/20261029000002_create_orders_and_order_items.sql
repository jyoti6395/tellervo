-- ====================================================================
-- Tellervo: Orders, Order Items, Payments & Status History Migration
-- Migration: 20261029000002_create_orders_and_order_items.sql
-- ====================================================================

-- 1. Create public.orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- e.g. #TL-84102
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'In Progress' CHECK (
    status IN ('Pending', 'In Progress', 'Completed', 'Cancelled', 'Refunded')
  ),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  currency TEXT NOT NULL DEFAULT 'EUR',
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_total NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount_total >= 0),
  shipping_total NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (shipping_total >= 0),
  grand_total NUMERIC(10,2) NOT NULL CHECK (grand_total > 0),
  delivery_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_note TEXT,
  hidden_from_history_at TIMESTAMPTZ,
  history_hidden_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create public.order_items table (Immutable Purchase Snapshots linked to public.products)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  volume TEXT,
  sku TEXT,
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0),
  product_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create public.payments table (Payment Attempts & Simulator Tracking)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'dummy_simulator',
  provider_payment_id TEXT UNIQUE NOT NULL, -- e.g. PAY-FI-782910
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  payment_method TEXT NOT NULL DEFAULT 'Dummy Simulation',
  authorized_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create public.order_status_history table (Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Performance Indices
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_hidden ON public.orders(user_id, hidden_from_history_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON public.payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- 6. Updated_at Trigger Functions
CREATE OR REPLACE FUNCTION public.handle_order_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_orders_updated_at ON public.orders;
CREATE TRIGGER on_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_updated_at();

DROP TRIGGER IF EXISTS on_payments_updated_at ON public.payments;
CREATE TRIGGER on_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_updated_at();

-- 7. Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- 7.1 Orders RLS Policies
DROP POLICY IF EXISTS "Users can view own orders or Admin view all" ON public.orders;
CREATE POLICY "Users can view own orders or Admin view all"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Active users can insert own orders" ON public.orders;
CREATE POLICY "Active users can insert own orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id OR public.is_admin()) AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.status <> 'deactive'
    )
  );

DROP POLICY IF EXISTS "Users can update own order visibility or Admin update all" ON public.orders;
CREATE POLICY "Users can update own order visibility or Admin update all"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins only can delete orders" ON public.orders;
CREATE POLICY "Admins only can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 7.2 Order Items RLS Policies
DROP POLICY IF EXISTS "Users view line items for accessible orders" ON public.order_items;
CREATE POLICY "Users view line items for accessible orders"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users insert line items for own orders" ON public.order_items;
CREATE POLICY "Users insert line items for own orders"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can update or delete order items" ON public.order_items;
CREATE POLICY "Admins can update or delete order items"
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.3 Payments RLS Policies
DROP POLICY IF EXISTS "Users view payments for own orders or Admin all" ON public.payments;
CREATE POLICY "Users view payments for own orders or Admin all"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users or Admin insert payments for orders" ON public.payments;
CREATE POLICY "Users or Admin insert payments for orders"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins only can update or delete payments" ON public.payments;
CREATE POLICY "Admins only can update or delete payments"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.4 Order Status History RLS Policies
DROP POLICY IF EXISTS "Users view status history for accessible orders" ON public.order_status_history;
CREATE POLICY "Users view status history for accessible orders"
  ON public.order_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users or Admin insert status history" ON public.order_status_history;
CREATE POLICY "Users or Admin insert status history"
  ON public.order_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- 8. Atomic Order Creation Stored Procedure with Simulation
CREATE OR REPLACE FUNCTION public.create_order_with_simulation(
  p_order_payload JSONB,
  p_items_payload JSONB,
  p_payment_outcome TEXT, -- 'accept', 'decline', 'network_error'
  p_payment_id TEXT       -- e.g. 'PAY-FI-782910'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_status TEXT;
  v_order_id UUID;
  v_order_number TEXT;
  v_target_order_status TEXT;
  v_target_payment_status TEXT;
  v_subtotal NUMERIC(10,2);
  v_shipping NUMERIC(10,2);
  v_discount NUMERIC(10,2);
  v_grand_total NUMERIC(10,2);
  v_item JSONB;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order.';
  END IF;

  -- 1. Check account status: Deactivated accounts are strictly forbidden from placing orders
  SELECT status INTO v_user_status FROM public.profiles WHERE id = v_user_id;
  IF v_user_status = 'deactive' THEN
    RAISE EXCEPTION 'Your account has been deactivated. Orders cannot be submitted.';
  END IF;

  -- 2. Determine State Machine Outcome based on dummy payment selection
  IF p_payment_outcome = 'accept' THEN
    v_target_order_status := 'In Progress'; -- Displayed in customer app as "Processing"
    v_target_payment_status := 'paid';
  ELSIF p_payment_outcome = 'decline' THEN
    v_target_order_status := 'Cancelled';  -- Displayed in customer app as "Cancelled"
    v_target_payment_status := 'failed';
  ELSIF p_payment_outcome = 'network_error' THEN
    v_target_order_status := 'Pending';    -- Displayed in customer app as "Pending"
    v_target_payment_status := 'pending';
  ELSE
    RAISE EXCEPTION 'Invalid payment outcome supplied: %', p_payment_outcome;
  END IF;

  -- 3. Calculate Totals Server-Side
  v_subtotal := COALESCE((p_order_payload->>'subtotal')::NUMERIC, 0.00);
  v_discount := COALESCE((p_order_payload->>'discount_total')::NUMERIC, 0.00);
  v_shipping := COALESCE((p_order_payload->>'shipping_total')::NUMERIC, 0.00);
  v_grand_total := (v_subtotal - v_discount + v_shipping);

  IF v_grand_total <= 0 THEN
    v_grand_total := 0.01;
  END IF;

  -- 4. Generate Human-Friendly Nordic Order Number: #TL-XXXXX
  v_order_number := '#TL-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');

  -- 5. Insert Order Header
  INSERT INTO public.orders (
    order_number,
    user_id,
    status,
    payment_status,
    currency,
    subtotal,
    discount_total,
    shipping_total,
    grand_total,
    delivery_address,
    customer_name,
    customer_email,
    customer_phone,
    customer_note
  ) VALUES (
    v_order_number,
    v_user_id,
    v_target_order_status,
    v_target_payment_status,
    'EUR',
    v_subtotal,
    v_discount,
    v_shipping,
    v_grand_total,
    COALESCE(p_order_payload->'delivery_address', '{}'::jsonb),
    COALESCE(p_order_payload->>'customer_name', 'Tellervo Patron'),
    COALESCE(p_order_payload->>'customer_email', ''),
    p_order_payload->>'customer_phone',
    p_order_payload->>'customer_note'
  )
  RETURNING id INTO v_order_id;

  -- 6. Insert Order Items (Immutable Snapshots linked to public.products)
  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_items_payload, '[]'::jsonb))
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      volume,
      sku,
      unit_price,
      quantity,
      line_total,
      product_image_url
    ) VALUES (
      v_order_id,
      CASE 
        WHEN (v_item->>'product_id') ~ '^[0-9a-fA-F-]{36}$' THEN (v_item->>'product_id')::UUID 
        ELSE NULL 
      END,
      COALESCE(v_item->>'product_name', 'Botanical Item'),
      v_item->>'volume',
      v_item->>'sku',
      COALESCE((v_item->>'unit_price')::NUMERIC, 0.00),
      GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1),
      (COALESCE((v_item->>'unit_price')::NUMERIC, 0.00) * GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1)),
      v_item->>'product_image_url'
    );

    -- Decrement stock in public.products if payment was accepted and product exists
    IF p_payment_outcome = 'accept' AND (v_item->>'product_id') ~ '^[0-9a-fA-F-]{36}$' THEN
      UPDATE public.products
      SET 
        stock = GREATEST(stock - GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1), 0),
        status = CASE 
          WHEN GREATEST(stock - GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1), 0) = 0 THEN 'Out of Stock'
          WHEN GREATEST(stock - GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1), 0) <= 5 THEN 'Low Stock'
          ELSE status
        END,
        updated_at = timezone('utc'::text, now())
      WHERE id = (v_item->>'product_id')::UUID;
    END IF;
  END LOOP;

  -- 7. Insert Payment Record
  INSERT INTO public.payments (
    order_id,
    provider,
    provider_payment_id,
    amount,
    currency,
    status,
    payment_method,
    captured_at,
    failed_at,
    error_message
  ) VALUES (
    v_order_id,
    'dummy_simulator',
    p_payment_id,
    v_grand_total,
    'EUR',
    v_target_payment_status,
    'Dummy Simulation',
    CASE WHEN v_target_payment_status = 'paid' THEN timezone('utc'::text, now()) ELSE NULL END,
    CASE WHEN v_target_payment_status = 'failed' THEN timezone('utc'::text, now()) ELSE NULL END,
    CASE WHEN v_target_payment_status = 'failed' THEN 'Payment declined by patron during checkout simulation' ELSE NULL END
  );

  -- 8. Record Initial Order Status History Entry
  INSERT INTO public.order_status_history (
    order_id,
    previous_status,
    new_status,
    changed_by,
    reason
  ) VALUES (
    v_order_id,
    NULL,
    v_target_order_status,
    v_user_id,
    'Order created via checkout (simulation: ' || p_payment_outcome || ')'
  );

  -- 9. Return JSON with Order and Payment details
  SELECT jsonb_build_object(
    'order_id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'payment_status', o.payment_status,
    'grand_total', o.grand_total,
    'currency', o.currency,
    'payment_id', p_payment_id,
    'created_at', o.created_at
  ) INTO v_result
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_result;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.create_order_with_simulation TO authenticated;

