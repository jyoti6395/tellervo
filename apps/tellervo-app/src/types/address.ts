export type AddressType = 'home' | 'work' | 'locker' | 'other';

export interface SavedAddress {
  id: string;
  recipientName: string;
  phone?: string;
  type: AddressType;
  title: string;
  street: string;
  additionalDetails?: string;
  postalCode: string;
  city: string;
  countryCode: string;
  isDefault: boolean;
}

export interface AddressFormData {
  recipientName: string;
  type: AddressType;
  title?: string;
  street: string;
  additionalDetails?: string;
  postalCode: string;
  city: string;
  countryCode: string;
  phone?: string;
  isDefault: boolean;
}

export type AddressModalMode = 'add' | 'edit';
