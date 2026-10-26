-- ====================================================================
-- Tellervo: Supabase Authentication and Profiles Migration
-- Schema Version: 20261026000000
-- ====================================================================

-- 1. Create public.profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  tier TEXT DEFAULT 'Taiga Patron',
  seeds INTEGER DEFAULT 50,
  trees_planted INTEGER DEFAULT 18,
  address TEXT DEFAULT 'Mannerheimintie 14 B, Helsinki (Default)',
  payment_method TEXT DEFAULT 'Apple Pay •••• 9012',
  dietary_preferences TEXT DEFAULT 'Low sugar, zero-proof, vegan botanical extracts',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely ensure phone column exists if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Index for fast user profile lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies
-- Authenticated patrons can view only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated patrons can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Authenticated patrons can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Trigger Function: Automatically create profile on new user registration in auth.users
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
    trees_planted
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
    'Taiga Patron',
    50,
    18
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Trigger Function: Auto-update updated_at timestamp on profile edits
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Trigger Function: Automatically sync phone number into auth.users.phone column
CREATE OR REPLACE FUNCTION public.sync_auth_user_phone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'phone' IS NOT NULL AND (NEW.phone IS NULL OR NEW.phone = '') THEN
    NEW.phone := NEW.raw_user_meta_data->>'phone';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_phone_sync ON auth.users;
CREATE TRIGGER on_auth_user_phone_sync
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_phone();

-- 7. Update any existing users so their phone displays in the dashboard immediately
UPDATE auth.users
SET phone = raw_user_meta_data->>'phone'
WHERE phone IS NULL AND raw_user_meta_data->>'phone' IS NOT NULL;
