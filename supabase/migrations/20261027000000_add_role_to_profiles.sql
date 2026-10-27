-- ====================================================================
-- Tellervo: Add Role Column to Profiles and Update User Trigger
-- Migration: 20261027000000_add_role_to_profiles.sql
-- ====================================================================

-- 1. Safely add the 'role' column with default 'customer' if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer';
  END IF;
END $$;

-- 2. Backfill existing profile records where role is NULL to 'customer'
UPDATE public.profiles
SET role = 'customer'
WHERE role IS NULL;

-- 3. Ensure default value is set to 'customer' for all future inserts
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

-- 4. Update the trigger function handle_new_user to automatically assign role = 'customer'
-- and preserve any existing role on conflict
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    phone,
    full_name,
    avatar_url,
    tier,
    seeds,
    trees_planted,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
    'Taiga Patron',
    50,
    18,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

-- 5. Trigger to prevent non-service-role clients from tampering with role via direct update
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If role was changed and executing as an authenticated patron, reject role alteration
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.role() = 'authenticated' THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_protect_role ON public.profiles;
CREATE TRIGGER on_profiles_protect_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();
