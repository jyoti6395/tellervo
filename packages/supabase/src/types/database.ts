import type { ProfileRecord } from './auth';
import type { ProductRecord, CreateProductInput, UpdateProductInput } from './product';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRecord;
        Insert: Partial<ProfileRecord> & { id: string };
        Update: Partial<ProfileRecord>;
      };
      products: {
        Row: ProductRecord;
        Insert: CreateProductInput;
        Update: UpdateProductInput;
      };
    };
  };
}
