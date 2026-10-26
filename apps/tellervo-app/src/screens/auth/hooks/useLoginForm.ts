import { useState } from 'react';
import {
  LoginFormData,
  ValidationErrors,
  validateLoginForm,
  authService,
} from '@tellervo/supabase';
import { navigateTo, AUTH_ROUTES } from '../../../routes/authRoutes';
import { useApp } from '../../../context/AppContext';

/**
 * Controller Hook for Login Business Logic
 * 
 * Encapsulates form state, validation, Supabase sign-in,
 * error handling, and password recovery.
 */
export function useLoginForm() {
  const { login, showToast } = useApp();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordFeedback, setForgotPasswordFeedback] = useState<string | null>(null);

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field as keyof ValidationErrors];
        return next;
      });
    }
    if (submissionFeedback) {
      setSubmissionFeedback(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmissionFeedback(null);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmissionFeedback(null);

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);

      if (!result.success) {
        setSubmissionFeedback(result.error || 'Invalid credentials. Please verify your email and password.');
        return;
      }

      showToast(`Welcome, ${result.user?.name || 'Patron'}!`, 'success');
      navigateTo(AUTH_ROUTES.HOME);
    } catch {
      setSubmissionFeedback('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordFeedback('Please enter your email to receive recovery instructions.');
      return;
    }
    const result = await authService.resetPassword(forgotPasswordEmail);
    if (result.success) {
      setForgotPasswordFeedback(
        `A recovery link has been dispatched to ${forgotPasswordEmail.trim()}. Please inspect your inbox.`
      );
    } else {
      setForgotPasswordFeedback(result.error || 'Failed to dispatch recovery link.');
    }
  };

  return {
    formData,
    errors,
    showPassword,
    setShowPassword,
    isSubmitting,
    submissionFeedback,
    isForgotPasswordOpen,
    setIsForgotPasswordOpen,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordFeedback,
    setForgotPasswordFeedback,
    handleInputChange,
    handleSubmit,
    handleForgotPasswordSubmit,
  };
}
