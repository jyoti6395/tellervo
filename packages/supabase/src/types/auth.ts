export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'admin' | 'customer' | 'patron' | string;
  memberSince?: string;
  avatarUrl?: string;
  tier?: string;
  seeds?: number;
  treesPlanted?: number;
  address?: string;
  paymentMethod?: string;
  dietaryPreferences?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
  confirmationRequired?: boolean;
}

export interface ProfileRecord {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  tier?: string;
  seeds?: number;
  trees_planted?: number;
  address?: string;
  payment_method?: string;
  dietary_preferences?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}
