import { z } from 'zod';
import type { CountryCode } from 'libphonenumber-js';
import { validatePhoneNumber } from '../utils/phoneUtils';

const NAME_REGEX = /^[\p{L}\s'.-]+$/u;

/**
 * Creates a country-aware Zod validation schema for Delivery Addresses.
 * Default country is Finland ('FI').
 */
export const createAddressSchema = (countryCode: string = 'FI') =>
  z.object({
    recipientName: z
      .string()
      .trim()
      .min(1, 'Recipient name is required.')
      .min(2, 'Recipient name must be at least 2 characters.')
      .max(60, 'Recipient name cannot exceed 60 characters.')
      .regex(NAME_REGEX, 'Recipient name should contain valid letters and spaces.'),
    type: z.enum(['home', 'work', 'locker', 'other']),
    title: z
      .string()
      .trim()
      .max(40, 'Label cannot exceed 40 characters.')
      .optional(),
    street: z
      .string()
      .trim()
      .min(1, 'Street address is required.')
      .min(3, 'Street address must be at least 3 characters (e.g. Mannerheimintie 14 B).')
      .max(100, 'Street address cannot exceed 100 characters.'),
    additionalDetails: z
      .string()
      .trim()
      .max(100, 'Additional details cannot exceed 100 characters.')
      .optional(),
    postalCode: z
      .string()
      .trim()
      .min(1, 'Postal code is required.')
      .refine(
        (val) => {
          if (countryCode === 'FI') {
            return /^\d{5}$/.test(val);
          }
          return val.length >= 3 && val.length <= 10;
        },
        {
          message:
            countryCode === 'FI'
              ? 'Finnish postal code must be exactly 5 digits (e.g. 00100).'
              : 'Please enter a valid postal code.',
        }
      ),
    city: z
      .string()
      .trim()
      .min(1, 'City is required.')
      .min(2, 'City name must be at least 2 characters.')
      .max(60, 'City name cannot exceed 60 characters.'),
    countryCode: z.string(),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || !val.trim()) return true;
          return validatePhoneNumber(val, countryCode as CountryCode).isValid;
        },
        {
          message: 'Please enter a valid phone number for delivery SMS notifications.',
        }
      ),
    isDefault: z.boolean(),
  });

export const addressSchema = createAddressSchema('FI');
export type AddressSchemaType = z.infer<typeof addressSchema>;
