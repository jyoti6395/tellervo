/**
 * Tellervo Dashboard Supabase Client
 * 
 * Re-exported from @tellervo/supabase shared monorepo package.
 */
export {
  supabase,
  createCustomSupabaseClient,
  authService,
  profileService,
  productService,
  ProductService,
} from '@tellervo/supabase';
export type {
  AuthUser,
  ProfileRecord,
  User,
  Session,
  SupabaseClient,
  ProductRecord,
  CreateProductInput,
  UpdateProductInput,
  ProductStatus,
} from '@tellervo/supabase';

export const isSupabaseConfigured = (): boolean => {
  return true;
};
