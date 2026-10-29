export type ProductStatus = 'Active' | 'Low Stock' | 'Out of Stock' | 'Draft' | 'Archived';

export interface FlavorProfileRecord {
  bitterness?: number;
  sweetness?: number;
  aromatics?: number;
  effervescence?: number;
  [key: string]: number | undefined;
}

export interface ProductRecord {
  id: string;
  created_by?: string | null;
  updated_by?: string | null;
  name: string;
  category: string;
  volume?: string | null;
  original_price: number;
  discount_price?: number | null;
  price?: number; // backwards compatibility alias
  stock: number;
  status: ProductStatus;
  description?: string | null;
  images: string[];
  image_url?: string | null; // backwards compatibility alias
  sku?: string | null;
  badge?: string | null;
  badge_type?: string | null;
  is_featured: boolean;
  is_most_selling: boolean;
  most_selling?: boolean;
  flavor_profile?: FlavorProfileRecord | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  volume?: string;
  original_price?: number;
  discount_price?: number | null;
  price?: number; // backwards compatibility fallback
  stock: number;
  status?: ProductStatus;
  description?: string;
  images?: string[];
  image_url?: string; // backwards compatibility fallback
  sku?: string;
  badge?: string | null;
  badge_type?: string | null;
  is_featured?: boolean;
  is_most_selling?: boolean;
  most_selling?: boolean;
  flavor_profile?: FlavorProfileRecord | null;
  created_by?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilters {
  category?: string;
  status?: ProductStatus | 'all';
  search?: string;
  volume?: string | string[];
  priceRange?: 'all' | 'under-100' | '100-500' | 'under-500' | 'above-500';
  limit?: number;
  offset?: number;
}
