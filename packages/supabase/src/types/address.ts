export type AddressType = 'home' | 'work' | 'locker' | 'other';

export interface AddressRecord {
  id: string;
  user_id: string;
  recipient_name: string;
  phone?: string;
  type: AddressType;
  title?: string;
  street: string;
  additional_details?: string;
  postal_code: string;
  city: string;
  country_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressInput {
  recipient_name: string;
  phone?: string;
  type: AddressType;
  title?: string;
  street: string;
  additional_details?: string;
  postal_code: string;
  city: string;
  country_code?: string;
  is_default?: boolean;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {}

