import { parsePhoneNumberFromString, AsYouType, type CountryCode } from 'libphonenumber-js';
import { getCountryByCode } from '../config/countries.config';

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
  country?: CountryCode;
}

/**
 * Validates a phone number against a specific country numbering plan.
 * Accepts domestic input (e.g. "040 123 4567") or international input (e.g. "+358 40 123 4567").
 * Returns whether it is valid, an informative error message if invalid, and the normalized E.164 string.
 */
export function validatePhoneNumber(
  rawPhone: string | undefined | null,
  countryCode: CountryCode = 'FI'
): PhoneValidationResult {
  if (!rawPhone || !rawPhone.trim()) {
    // Empty phone is considered structurally valid at the utility level;
    // whether it is required or optional is enforced by the schema.
    return { isValid: true, normalized: '' };
  }

  const trimmed = rawPhone.trim();
  const targetCountry = getCountryByCode(countryCode);

  try {
    const parsed = parsePhoneNumberFromString(trimmed, countryCode);

    if (!parsed || !parsed.isValid()) {
      return {
        isValid: false,
        error: `Please enter a valid phone number for ${targetCountry.name}.`,
      };
    }

    return {
      isValid: true,
      normalized: parsed.number, // E.164 format, e.g. "+358401234567"
      country: parsed.country,
    };
  } catch {
    return {
      isValid: false,
      error: `Please enter a valid phone number for ${targetCountry.name}.`,
    };
  }
}

/**
 * Normalizes a valid phone number into canonical E.164 format (e.g. "+358401234567").
 * If the number is empty or cannot be parsed, returns undefined.
 */
export function normalizePhoneNumber(
  rawPhone: string | undefined | null,
  countryCode: CountryCode = 'FI'
): string | undefined {
  if (!rawPhone || !rawPhone.trim()) return undefined;
  const validation = validatePhoneNumber(rawPhone, countryCode);
  return validation.isValid && validation.normalized ? validation.normalized : undefined;
}

/**
 * Live formatting for inputs using AsYouType formatter.
 */
export function formatAsYouType(
  rawPhone: string,
  countryCode: CountryCode = 'FI'
): string {
  if (!rawPhone) return '';
  const formatter = new AsYouType(countryCode);
  return formatter.input(rawPhone);
}

/**
 * Formats a phone number for display in national format (e.g. "040 123 4567" for FI).
 */
export function formatPhoneNumberNational(
  phone: string | undefined | null,
  countryCode: CountryCode = 'FI'
): string {
  if (!phone) return '';
  try {
    const parsed = parsePhoneNumberFromString(phone, countryCode);
    if (parsed) {
      return parsed.formatNational();
    }
  } catch {
    // fallback to original if parsing fails
  }
  return phone;
}

/**
 * Detects the country code from an international format phone number.
 */
export function detectCountryFromPhone(phone: string): CountryCode | undefined {
  if (!phone || !phone.startsWith('+')) return undefined;
  try {
    const parsed = parsePhoneNumberFromString(phone);
    return parsed?.country;
  } catch {
    return undefined;
  }
}

/**
 * Extracts and formats only the national/domestic phone number without the international calling code.
 * (e.g. "+358401234567" -> "040 123 4567")
 */
export function getNationalNumberWithoutCallingCode(
  phone: string | undefined | null,
  countryCode: CountryCode = 'FI'
): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  try {
    const parsed = parsePhoneNumberFromString(trimmed, countryCode);
    if (parsed) {
      return parsed.formatNational();
    }
  } catch {
    // fallback
  }

  const country = getCountryByCode(countryCode);
  if (trimmed.startsWith(country.dialCode)) {
    return trimmed.slice(country.dialCode.length).trim();
  }
  if (trimmed.startsWith('+')) {
    return trimmed.replace(/^\+\d{1,4}\s*/, '');
  }
  return trimmed;
}

