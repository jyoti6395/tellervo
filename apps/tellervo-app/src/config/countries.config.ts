import type { CountryCode } from 'libphonenumber-js';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  nativeName: string;
  dialCode: string;
  flag: string;
  exampleNumber: string;
  postalCodeRegex?: RegExp;
}

export const DEFAULT_COUNTRY: CountryConfig = {
  code: 'FI',
  name: 'Finland',
  nativeName: 'Suomi',
  dialCode: '+358',
  flag: '🇫🇮',
  exampleNumber: '040 123 4567',
  postalCodeRegex: /^\d{5}$/,
};

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  DEFAULT_COUNTRY,
  { code: 'SE', name: 'Sweden', nativeName: 'Sverige', dialCode: '+46', flag: '🇸🇪', exampleNumber: '070 123 4567' },
  { code: 'NO', name: 'Norway', nativeName: 'Norge', dialCode: '+47', flag: '🇳🇴', exampleNumber: '412 34 567' },
  { code: 'DK', name: 'Denmark', nativeName: 'Danmark', dialCode: '+45', flag: '🇩🇰', exampleNumber: '20 12 34 56' },
  { code: 'EE', name: 'Estonia', nativeName: 'Eesti', dialCode: '+372', flag: '🇪🇪', exampleNumber: '512 3456' },
  { code: 'DE', name: 'Germany', nativeName: 'Deutschland', dialCode: '+49', flag: '🇩🇪', exampleNumber: '0151 1234567' },
  { code: 'GB', name: 'United Kingdom', nativeName: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', exampleNumber: '07911 123456' },
  { code: 'US', name: 'United States', nativeName: 'United States', dialCode: '+1', flag: '🇺🇸', exampleNumber: '(202) 555-0123' },
  { code: 'FR', name: 'France', nativeName: 'France', dialCode: '+33', flag: '🇫🇷', exampleNumber: '06 12 34 56 78' },
  { code: 'ES', name: 'Spain', nativeName: 'España', dialCode: '+34', flag: '🇪🇸', exampleNumber: '612 34 56 78' },
  { code: 'IT', name: 'Italy', nativeName: 'Italia', dialCode: '+39', flag: '🇮🇹', exampleNumber: '312 345 6789' },
  { code: 'NL', name: 'Netherlands', nativeName: 'Nederland', dialCode: '+31', flag: '🇳🇱', exampleNumber: '06 12345678' },
];

/**
 * Returns the country configuration for a given 2-letter ISO code.
 * Falls back to DEFAULT_COUNTRY (Finland) if not found.
 */
export function getCountryByCode(code?: string): CountryConfig {
  if (!code) return DEFAULT_COUNTRY;
  const upper = code.toUpperCase();
  return SUPPORTED_COUNTRIES.find((c) => c.code === upper) || DEFAULT_COUNTRY;
}

/**
 * Finds country configuration matching an international dialing code (e.g. "+358" or "+46").
 */
export function getCountryByDialCode(dialCode: string): CountryConfig | undefined {
  const normalized = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  return SUPPORTED_COUNTRIES.find((c) => c.dialCode === normalized);
}
