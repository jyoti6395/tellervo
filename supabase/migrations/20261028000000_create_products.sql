-- ====================================================================
-- Tellervo: Products Table, Admin Tracking, RLS and Storage Bucket
-- Migration: 20261028000000_create_products.sql
-- ====================================================================

-- 1. Helper Function: Check if the calling user has role = 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Grant execution to authenticated & anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 2. Create products table (Strictly matching the Add Product UI)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  volume TEXT DEFAULT '330 ml',
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (
    status IN ('Active', 'Low Stock', 'Out of Stock', 'Draft', 'Archived', 'active', 'low_stock', 'out_of_stock', 'draft', 'archived')
  ),
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sku TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Safely remove is_featured, ingredients, and tags if they were previously created
ALTER TABLE public.products DROP COLUMN IF EXISTS is_featured;
ALTER TABLE public.products DROP COLUMN IF EXISTS ingredients;
ALTER TABLE public.products DROP COLUMN IF EXISTS tags;

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products (created_by);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- 3. Automatic updated_at and updated_by trigger
CREATE OR REPLACE FUNCTION public.handle_product_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_products_update ON public.products;
CREATE TRIGGER on_products_update
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_product_update();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4.1 SELECT Policy: Everyone can view active products, Admins can view all products
DROP POLICY IF EXISTS "Public read active products or admin read all" ON public.products;
CREATE POLICY "Public read active products or admin read all"
  ON public.products
  FOR SELECT
  USING (
    status IN ('Active', 'active') OR public.is_admin()
  );

-- 4.2 INSERT Policy: STRICTLY ADMIN ONLY. created_by automatically bound to auth.uid()
DROP POLICY IF EXISTS "Admins only can insert products" ON public.products;
CREATE POLICY "Admins only can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    public.is_admin() AND (created_by IS NULL OR created_by = auth.uid())
  );

-- 4.3 UPDATE Policy: STRICTLY ADMIN ONLY
DROP POLICY IF EXISTS "Admins only can update products" ON public.products;
CREATE POLICY "Admins only can update products"
  ON public.products
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- 4.4 DELETE Policy: STRICTLY ADMIN ONLY
DROP POLICY IF EXISTS "Admins only can delete products" ON public.products;
CREATE POLICY "Admins only can delete products"
  ON public.products
  FOR DELETE
  USING (
    public.is_admin()
  );

-- 5. Storage: Configure 'product-images' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- 6. Seed initial catalog items if table is empty
INSERT INTO public.products (name, category, volume, price, stock, status, description, image_url, sku)
SELECT
  'Pine Forest Tonic',
  'Adaptogenic Tonics',
  '330 ml',
  14.50,
  24,
  'Active',
  'Deep pine needle distillation with organic Indian ashwagandha root and fresh Amalfi lemon zest.',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80',
  'TEL-PFT-001'
WHERE NOT EXISTS (SELECT 1 FROM public.products LIMIT 1);

INSERT INTO public.products (name, category, volume, price, stock, status, description, image_url, sku)
SELECT
  'Wild Berry Spritz',
  'Wild Berry Spritz',
  '250 ml',
  15.80,
  18,
  'Active',
  'Hand-picked Lapland lingonberries cold pressed with organic Nile hibiscus and fresh spearmint leaves.',
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&auto=format&fit=crop&q=80',
  'TEL-WBS-002'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TEL-WBS-002');

INSERT INTO public.products (name, category, volume, price, stock, status, description, image_url, sku)
SELECT
  'Lemon Grass Cooler',
  'Zero-Proof Spirits',
  '500 ml',
  12.50,
  32,
  'Active',
  'Steeped organic lemongrass with warm wild ginger notes and tangy cold-pressed Persian lime juice.',
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80',
  'TEL-LGC-003'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TEL-LGC-003');

INSERT INTO public.products (name, category, volume, price, stock, status, description, image_url, sku)
SELECT
  'Citrus Blossom Tonic',
  'Adaptogenic Tonics',
  '330 ml',
  13.90,
  6,
  'Low Stock',
  'Calabrian bergamot essence infused with delicate wild elderflower and crisp Alpine herbs.',
  'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=300&auto=format&fit=crop&q=80',
  'TEL-CBT-004'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'TEL-CBT-004');
