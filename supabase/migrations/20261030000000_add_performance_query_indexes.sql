-- ====================================================================
-- Tellervo: Database Performance & Query Optimization Indexes
-- Migration: 20261030000000_add_performance_query_indexes.sql
-- Purpose: Accelerate catalog browsing, category filtering, customer
--          order history, payments, and addresses queries with zero
--          changes to existing schema, constraints, data, or application flow.
-- NOTE: 100% Non-destructive and additive (CREATE INDEX IF NOT EXISTS only)
-- ====================================================================

-- 1. Composite Index for Public Catalog Browsing (status = 'Active' ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_products_status_created_at 
  ON public.products (status, created_at DESC);

-- 2. Composite Index for Category Filtering (category = ? AND status = ? ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_products_category_status_created 
  ON public.products (category, status, created_at DESC);

-- 3. Partial Index for Customer Active Order History (user_id = ? AND hidden_from_history_at IS NULL ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_orders_user_active_history 
  ON public.orders (user_id, created_at DESC) 
  WHERE hidden_from_history_at IS NULL;

-- 4. Composite Index for Order Payments Lookup and Recency Sorting (order_id IN (...) ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_payments_order_created 
  ON public.payments (order_id, created_at DESC);

-- 5. Composite Index for Order Status History Audit Trail (order_id IN (...) ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_created 
  ON public.order_status_history (order_id, created_at DESC);

-- 6. Composite Index for Delivery Addresses (user_id = ? ORDER BY is_default DESC, created_at DESC)
CREATE INDEX IF NOT EXISTS idx_addresses_user_default_created 
  ON public.addresses (user_id, is_default DESC, created_at DESC);

-- 7. Trigram Extension and GIN Index for fast substring search on Product Names (name ILIKE '%term%')
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
  ON public.products USING gin (name gin_trgm_ops);
