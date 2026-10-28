-- ====================================================================
-- Tellervo: Allow Public Customers to View Active, Low Stock, and Out of Stock Products
-- Migration: 20261028000001_allow_public_read_all_catalog_products.sql
-- ====================================================================

-- Update SELECT policy so storefront customers can see products that are 
-- Active, Low Stock, or Out of Stock (only Draft and Archived remain hidden from public)
DROP POLICY IF EXISTS "Public read active products or admin read all" ON public.products;

CREATE POLICY "Public read active products or admin read all"
  ON public.products
  FOR SELECT
  USING (
    status IN ('Active', 'active', 'Low Stock', 'low_stock', 'Out of Stock', 'out_of_stock') 
    OR public.is_admin()
  );

