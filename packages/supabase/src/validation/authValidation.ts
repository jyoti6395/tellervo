/**
 * Shared Authentication Form Validation
 * 
 * Reusable and typed validation helpers for both tellervo-app and tellervo-dashboard.
 */

export interface SignupFormData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g., name@domain.com).';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return null;
}

export function validateSignupForm(data: SignupFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // Full Name
  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  // Email
  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  // Phone (optional - validate format if provided: must be exactly 10 digits)
  if (data.phone && data.phone.trim()) {
    const cleaned = data.phone.replace(/[\s\-()]/g, '');
    if (!/^[0-9]{10}$/.test(cleaned)) {
      errors.phone = 'Phone number must be exactly 10 digits (e.g. 9876543210).';
    }
  }

  // Password
  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  // Confirm Password
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginForm(data: LoginFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
