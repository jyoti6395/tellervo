import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CountryCode } from 'libphonenumber-js';
import { navigateTo, AUTH_ROUTES } from '../../../routes/authRoutes';
import { useApp } from '../../../context/AppContext';
import { createSignupSchema, SignupSchemaType } from '../schemas/authSchemas';
import { normalizePhoneNumber } from '../../../utils/phoneUtils';
import type { CountryConfig } from '../../../config/countries.config';

/**
 * Controller Hook for Signup Business Logic using React Hook Form & Country-Aware Zod Validation
 */
export function useSignupForm() {
  const { signup, showToast } = useApp();

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('FI');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [isSuccessNotice, setIsSuccessNotice] = useState(false);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchemaType>({
    resolver: (values, context, options) => {
      return zodResolver(createSignupSchema(selectedCountry))(values, context, options);
    },
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
    mode: 'onTouched',
  });

  const phoneValue = watch('phone') || '';

  const handlePhoneChange = (val: string) => {
    setValue('phone', val, { shouldValidate: true, shouldDirty: true });
  };

  const handleCountryChange = (country: CountryConfig) => {
    setSelectedCountry(country.code);
    if (phoneValue) {
      setTimeout(() => {
        trigger('phone');
      }, 0);
    }
  };

  const onSubmit = async (data: SignupSchemaType) => {
    setSubmissionFeedback(null);
    setIsSuccessNotice(false);

    try {
      // Normalize valid phone to canonical E.164 (e.g. +358401234567) before sending to Supabase
      const normalizedPhone = data.phone
        ? normalizePhoneNumber(data.phone, selectedCountry)
        : undefined;

      const result = await signup(data.email, data.password, data.fullName, normalizedPhone || undefined);

      if (!result.success) {
        setIsSuccessNotice(false);
        setSubmissionFeedback(result.error || 'Failed to create account. Please check your information.');
        return;
      }

      if (result.confirmationRequired) {
        setIsSuccessNotice(true);
        setSubmissionFeedback(
          'Account created successfully! A confirmation email has been sent to your inbox. Please verify your email before signing in.'
        );
        showToast('Confirmation email sent! Please check your inbox.', 'info');
        return;
      }

      showToast(`Welcome to the Boreal Cellar, ${result.user?.name || 'Patron'}!`, 'success');
      navigateTo(AUTH_ROUTES.HOME);
    } catch {
      setIsSuccessNotice(false);
      setSubmissionFeedback('An unexpected error occurred during account creation. Please try again.');
    }
  };

  return {
    register,
    handleSubmit: rhfHandleSubmit(onSubmit),
    errors,
    isSubmitting,
    selectedCountry,
    handleCountryChange,
    phoneValue,
    handlePhoneChange,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    submissionFeedback,
    isSuccessNotice,
  };
}
