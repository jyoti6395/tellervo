-- ====================================================================
-- Tellervo: Cascade Cleanup of Deleted Products/Orders from User Favourites
-- Migration: 20261028000003_cleanup_favourite_on_product_delete.sql
-- ====================================================================

-- 1. Helper trigger function to remove deleted item ID from all user favourites
CREATE OR REPLACE FUNCTION public.cleanup_deleted_id_from_favourites()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a product (or order) is deleted, remove its UUID from the order_ids array across all user records
  UPDATE public.favourite
  SET order_ids = array_remove(order_ids, OLD.id),
      updated_at = timezone('utc'::text, now())
  WHERE OLD.id = ANY(order_ids);

  RETURN OLD;
END;
$$;

-- 2. Attach trigger to public.products table
DROP TRIGGER IF EXISTS trigger_cleanup_favourite_on_product_delete ON public.products;
CREATE TRIGGER trigger_cleanup_favourite_on_product_delete
  AFTER DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_deleted_id_from_favourites();

-- 3. If public.orders table exists or is created, attach trigger as well
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_cleanup_favourite_on_order_delete ON public.orders;
    CREATE TRIGGER trigger_cleanup_favourite_on_order_delete
      AFTER DELETE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.cleanup_deleted_id_from_favourites();
  END IF;
END $$;

-- 4. Expose dedicated callable RPC function for service-level administrative cleanup
CREATE OR REPLACE FUNCTION public.remove_deleted_ids_from_favourites(target_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  FOREACH target_id IN ARRAY target_ids
  LOOP
    UPDATE public.favourite
    SET order_ids = array_remove(order_ids, target_id),
        updated_at = timezone('utc'::text, now())
    WHERE target_id = ANY(order_ids);
  END LOOP;
END;
$$;

