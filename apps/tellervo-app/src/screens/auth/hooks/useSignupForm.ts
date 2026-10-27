import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigateTo, AUTH_ROUTES } from '../../../routes/authRoutes';
import { useApp } from '../../../context/AppContext';
import { signupSchema, SignupSchemaType } from '../schemas/authSchemas';

/**
 * Controller Hook for Signup Business Logic using React Hook Form & Zod
 */
export function useSignupForm() {
  const { signup, showToast } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [isSuccessNotice, setIsSuccessNotice] = useState(false);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
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

  const onSubmit = async (data: SignupSchemaType) => {
    setSubmissionFeedback(null);
    setIsSuccessNotice(false);

    try {
      const result = await signup(data.email, data.password, data.fullName, data.phone);

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
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    submissionFeedback,
    isSuccessNotice,
  };
}
