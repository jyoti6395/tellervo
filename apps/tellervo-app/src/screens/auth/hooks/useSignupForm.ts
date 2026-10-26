import { useState } from 'react';
import {
  SignupFormData,
  ValidationErrors,
  validateSignupForm,
} from '@tellervo/supabase';
import { navigateTo, AUTH_ROUTES } from '../../../routes/authRoutes';
import { useApp } from '../../../context/AppContext';

/**
 * Controller Hook for Signup Business Logic
 * 
 * Encapsulates form state, validation, phone number management,
 * Supabase account creation, and email verification notice handling.
 */
export function useSignupForm() {
  const { signup, showToast } = useApp();
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: true,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [isSuccessNotice, setIsSuccessNotice] = useState(false);

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field as keyof ValidationErrors];
        return next;
      });
    }
    if (submissionFeedback) {
      setSubmissionFeedback(null);
      setIsSuccessNotice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    // Validate form
    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmissionFeedback(null);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmissionFeedback(null);
    setIsSuccessNotice(false);

    try {
      const result = await signup(formData.email, formData.password, formData.fullName, formData.phone);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSubmitting,
    submissionFeedback,
    isSuccessNotice,
    handleInputChange,
    handleSubmit,
  };
}
