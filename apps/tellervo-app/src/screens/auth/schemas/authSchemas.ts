import { z } from 'zod';
import type { CountryCode } from 'libphonenumber-js';
import { validatePhoneNumber } from '../../../utils/phoneUtils';
import { getCountryByCode } from '../../../config/countries.config';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
// Supports international Unicode letters (including Nordic characters ä, ö, å), spaces, hyphens, and apostrophes
const NAME_REGEX = /^[\p{L}\s'.-]+$/u;

/**
 * Zod Schema for Sign In
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .max(254, 'Email address cannot exceed 254 characters.')
    .regex(EMAIL_REGEX, 'Please enter a valid email address (e.g., name@domain.com).'),
  password: z
    .string()
    .min(1, 'Password is required.'),
  rememberMe: z
    .boolean(),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

/**
 * Creates a country-aware Zod schema for Sign Up.
 * Defaults to Finland ('FI') if no country is specified.
 */
export const createSignupSchema = (countryCode: CountryCode = 'FI') =>
  z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, 'Full name is required.')
        .min(2, 'Full name must be at least 2 characters.')
        .max(60, 'Full name cannot exceed 60 characters.')
        .regex(NAME_REGEX, 'Full name should only contain letters and spaces.'),
      email: z
        .string()
        .trim()
        .min(1, 'Email address is required.')
        .max(254, 'Email address cannot exceed 254 characters.')
        .regex(EMAIL_REGEX, 'Please enter a valid email address (e.g., name@domain.com).'),
      countryCode: z
        .string()
        .optional(),
      phone: z
        .string()
        .optional()
        .refine(
          (val) => {
            if (!val || !val.trim()) return true;
            return validatePhoneNumber(val, countryCode).isValid;
          },
          {
            message: `Please enter a valid phone number for ${getCountryByCode(countryCode).name}.`,
          }
        ),
      password: z
        .string()
        .min(1, 'Password is required.')
        .min(8, 'Password must be at least 8 characters long.')
        .max(100, 'Password cannot exceed 100 characters.'),
      confirmPassword: z
        .string()
        .min(1, 'Please confirm your password.'),
      acceptTerms: z
        .boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    });

/**
 * Default Sign Up schema targeting Finland ('FI')
 */
export const signupSchema = createSignupSchema('FI');

export type SignupSchemaType = z.infer<typeof signupSchema>;
