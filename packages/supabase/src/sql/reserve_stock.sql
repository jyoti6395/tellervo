-- ==============================================================================
-- ATOMIC STOCK RESERVATION & VERIFICATION SYSTEM FOR TELLERVO
-- Flow:
--   1. User clicks "Buy Now" or "Proceed to Payment"
--   2. Check real-time stock in database
--   3. Reserve stock atomically with row-level lock (FOR UPDATE)
--      "Ek bottle sirf ek order ko mil sakti hai"
--   4. Branch:
--      - If available -> proceed with payment
--      - If unavailable -> halt payment, prompt "Notify Me"
-- ==============================================================================

-- 1. Atomic reservation function for a single item
CREATE OR REPLACE FUNCTION reserve_product_stock(
  p_product_id text,
  p_quantity int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product record;
  v_new_stock int;
  v_new_status text;
BEGIN
  -- Row-level lock on the product row (prevents race conditions)
  SELECT id, name, stock, status INTO v_product
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'not_found',
      'product_id', p_product_id,
      'message', 'Product not found in cellar catalog'
    );
  END IF;

  -- Verify real-time stock availability
  IF v_product.stock < p_quantity OR v_product.status = 'Out of Stock' THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'out_of_stock',
      'product_id', p_product_id,
      'product_name', v_product.name,
      'available_stock', v_product.stock,
      'requested_quantity', p_quantity,
      'message', format('Only %s left of %s (requested %s)', v_product.stock, v_product.name, p_quantity)
    );
  END IF;

  -- Calculate remaining stock and update status
  v_new_stock := v_product.stock - p_quantity;
  IF v_new_stock <= 0 THEN
    v_new_status := 'Out of Stock';
  ELSIF v_new_stock <= 5 THEN
    v_new_status := 'Low Stock';
  ELSE
    v_new_status := 'Active';
  END IF;

  -- Atomically decrement stock
  UPDATE products
  SET stock = v_new_stock,
      status = v_new_status,
      updated_at = now()
  WHERE id = p_product_id;

  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'product_name', v_product.name,
    'requested_quantity', p_quantity,
    'remaining_stock', v_new_stock,
    'new_status', v_new_status,
    'message', 'Stock successfully reserved'
  );
END;
$$;

-- 2. Release / Rollback function in case payment is aborted or order cancelled
CREATE OR REPLACE FUNCTION release_product_stock(
  p_product_id text,
  p_quantity int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock int;
  v_new_stock int;
  v_new_status text;
BEGIN
  SELECT stock INTO v_current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF FOUND THEN
    v_new_stock := COALESCE(v_current_stock, 0) + p_quantity;
    IF v_new_stock <= 0 THEN
      v_new_status := 'Out of Stock';
    ELSIF v_new_stock <= 5 THEN
      v_new_status := 'Low Stock';
    ELSE
      v_new_status := 'Active';
    END IF;

    UPDATE products
    SET stock = v_new_stock,
        status = v_new_status,
        updated_at = now()
    WHERE id = p_product_id;
  END IF;
END;
$$;

