-- ====================================================================
-- Tellervo: Addresses Table and Row Level Security Migration
-- Migration: 20261028000001_create_addresses.sql
-- ====================================================================

-- 1. Create public.addresses table explicitly linked to public.profiles
-- This enables Supabase Studio Table Editor and Schema Visualizer to display
-- foreign key relationship chips linking each address to its patron profile.
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone TEXT,
  type TEXT NOT NULL DEFAULT 'home' CHECK (type IN ('home', 'work', 'locker', 'other')),
  title TEXT,
  street TEXT NOT NULL,
  additional_details TEXT,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'FI',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses (user_id, is_default);

-- 2. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_address_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_addresses_update ON public.addresses;
CREATE TRIGGER on_addresses_update
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_address_update();

-- 3. Trigger Function: Sync default address directly to public.profiles.address
-- Whenever an address is inserted or updated with is_default = true,
-- automatically mirror the address string into public.profiles for instant profile card rendering.
CREATE OR REPLACE FUNCTION public.sync_profile_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Unset previous default addresses for this user to ensure only one default exists
    UPDATE public.addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id <> NEW.id;

    -- Sync to public.profiles
    UPDATE public.profiles
    SET
      address = NEW.street || ', ' || NEW.postal_code || ' ' || NEW.city || ' (Default)',
      updated_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_address_sync_default ON public.addresses;
CREATE TRIGGER on_address_sync_default
  AFTER INSERT OR UPDATE OF is_default ON public.addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.sync_profile_default_address();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 4.1 Policy: Authenticated users can manage their own addresses (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses"
  ON public.addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4.2 Policy: Administrators can view all addresses
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.addresses;
CREATE POLICY "Admins can view all addresses"
  ON public.addresses
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
