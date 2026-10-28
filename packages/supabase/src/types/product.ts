export type ProductStatus = 'Active' | 'Low Stock' | 'Out of Stock' | 'Draft' | 'Archived';

export interface ProductRecord {
  id: string;
  created_by?: string | null;
  updated_by?: string | null;
  name: string;
  category: string;
  volume?: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  description?: string | null;
  image_url?: string | null;
  sku?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  volume?: string;
  price: number;
  stock: number;
  status?: ProductStatus;
  description?: string;
  image_url?: string;
  sku?: string;
  created_by?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilters {
  category?: string;
  status?: ProductStatus | 'all';
  search?: string;
  limit?: number;
  offset?: number;
}
