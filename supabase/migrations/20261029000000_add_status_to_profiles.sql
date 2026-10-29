-- ====================================================================
-- Tellervo: Customer Account Status & Enhanced Registration Security
-- Migration: 20261029000000_add_status_to_profiles.sql
-- ====================================================================

-- 1. Safely add the 'status' column to public.profiles with valid values check and default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'deactive'));
  END IF;
END $$;

-- 2. Backfill any existing profiles where status is NULL to 'active'
UPDATE public.profiles
SET status = 'active'
WHERE status IS NULL;

-- 3. Ensure default value is explicitly 'active' for all future inserts
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'active';

-- 4. Index for high-performance status lookups and filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 5. Unique index to guarantee single-account phone assignment
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON public.profiles(phone)
  WHERE phone IS NOT NULL AND phone <> '';

-- 6. Trigger Function: Validate new user creation on auth.users before insertion
-- Enforces:
--  a) Re-registration with a deactivated email is prohibited.
--  b) Registration with an existing primary profile phone or default delivery address phone is prohibited.
--  c) Secondary (non-default) address numbers can still be registered with another email.
CREATE OR REPLACE FUNCTION public.validate_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_existing_status TEXT;
  v_input_phone TEXT;
BEGIN
  -- 1. Check if email already belongs to a deactivated customer profile
  SELECT status INTO v_existing_status
  FROM public.profiles
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;

  IF v_existing_status = 'deactive' THEN
    RAISE EXCEPTION 'This email is associated with a deactivated account. Please contact Help & Support for assistance.';
  END IF;

  -- 2. Inspect incoming phone number from registration metadata
  v_input_phone := NEW.raw_user_meta_data->>'phone';

  IF v_input_phone IS NOT NULL AND v_input_phone <> '' THEN
    -- Check if phone is already registered on another profile
    IF EXISTS (
      SELECT 1 FROM public.profiles
      WHERE phone IS NOT NULL AND phone = v_input_phone
    ) THEN
      RAISE EXCEPTION 'This phone number is already registered to another account. Please use a different phone number.';
    END IF;

    -- Check if phone is saved as a default delivery phone in public.addresses
    IF EXISTS (
      SELECT 1 FROM public.addresses
      WHERE phone IS NOT NULL AND phone = v_input_phone AND is_default = true
    ) THEN
      RAISE EXCEPTION 'This phone number is already saved as a default delivery phone on another account. Please use a different phone number.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_validate_registration ON auth.users;
CREATE TRIGGER on_auth_user_validate_registration
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.validate_new_auth_user();

-- 7. Update handle_new_user trigger to assign status = 'active' explicitly on customer signup
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
    role,
    status
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
    'customer',
    'active'
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

-- 8. Trigger Function: Prevent authenticated patrons from tampering with their own status
CREATE OR REPLACE FUNCTION public.protect_profile_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If status was changed and executing as an authenticated patron who is not admin, reject status alteration
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF auth.role() = 'authenticated' AND NOT public.is_admin() THEN
      NEW.status := OLD.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_protect_status ON public.profiles;
CREATE TRIGGER on_profiles_protect_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_status();

-- 9. Admin Policy: Allow administrators to update customer profiles (including status toggling)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. Pre-Flight Availability Function for Client Signup Forms
CREATE OR REPLACE FUNCTION public.check_signup_availability(
  p_email TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_status TEXT;
  v_phone_exists BOOLEAN := false;
BEGIN
  -- Verify Email
  SELECT status INTO v_status
  FROM public.profiles
  WHERE lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF v_status = 'deactive' THEN
    RETURN jsonb_build_object(
      'available', false,
      'code', 'EMAIL_DEACTIVATED',
      'error', 'This email is associated with a deactivated account. Please contact Help & Support for assistance.'
    );
  ELSIF v_status IS NOT NULL THEN
    RETURN jsonb_build_object(
      'available', false,
      'code', 'EMAIL_EXISTS',
      'error', 'An account with this email already exists. Please sign in instead.'
    );
  END IF;

  -- Verify Phone (Primary profile phone or default address phone)
  IF p_phone IS NOT NULL AND trim(p_phone) <> '' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE phone = trim(p_phone)
      UNION
      SELECT 1 FROM public.addresses WHERE phone = trim(p_phone) AND is_default = true
    ) INTO v_phone_exists;

    IF v_phone_exists THEN
      RETURN jsonb_build_object(
        'available', false,
        'code', 'PHONE_TAKEN',
        'error', 'This phone number is already registered to another account. Please use a different phone number.'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('available', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_signup_availability(TEXT, TEXT) TO anon, authenticated;

-- 11. Update get_customer_signups() to include status in the returned dataset
DROP FUNCTION IF EXISTS public.get_customer_signups();
CREATE OR REPLACE FUNCTION public.get_customer_signups()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT,
  joined_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Security check: Only allow users with admin role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can view customer sign-up data.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      p.full_name,
      'No Name'
    )::TEXT AS name,
    COALESCE(u.email::TEXT, ''::TEXT) AS email,
    COALESCE(
      u.phone::TEXT,
      u.raw_user_meta_data->>'phone',
      p.phone,
      'No Phone'
    )::TEXT AS phone,
    COALESCE(p.status, 'active')::TEXT AS status,
    u.created_at AS joined_date
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE 
    (p.role IS NULL OR p.role = 'customer')
    AND COALESCE(u.raw_app_meta_data->>'role', '') != 'admin'
    AND COALESCE(u.raw_user_meta_data->>'role', '') != 'admin'
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_signups() TO authenticated;

