import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@tellervo/supabase';
import { navigateTo, AUTH_ROUTES } from '../../../routes/authRoutes';
import { useNavigation } from '../../../routes/hooks/useNavigation';
import { useApp } from '../../../context/AppContext';
import { loginSchema, LoginSchemaType } from '../schemas/authSchemas';

/**
 * Sanitizes redirect destination to prevent open redirect vulnerabilities.
 */
function getSafeRedirectPath(redirect: string | null): string {
  if (!redirect) return AUTH_ROUTES.HOME;
  const decoded = decodeURIComponent(redirect);
  if (decoded.startsWith('/') && !decoded.startsWith('//')) {
    return decoded;
  }
  return AUTH_ROUTES.HOME;
}

/**
 * Controller Hook for Login Business Logic using React Hook Form & Zod
 */
export function useLoginForm() {
  const { login, showToast } = useApp();
  const { getRedirectQuery } = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordFeedback, setForgotPasswordFeedback] = useState<string | null>(null);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setSubmissionFeedback(null);

    try {
      const result = await login(data.email, data.password, data.rememberMe);

      if (!result.success) {
        setSubmissionFeedback(result.error || 'Invalid credentials. Please verify your email and password.');
        return;
      }

      const target = getSafeRedirectPath(getRedirectQuery());
      showToast(`Welcome, ${result.user?.name || 'Patron'}!`, 'success');
      navigateTo(target);
    } catch {
      setSubmissionFeedback('An unexpected error occurred during sign in. Please try again.');
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

  const openForgotPasswordModal = () => {
    const currentEmail = getValues('email') || '';
    setForgotPasswordEmail(currentEmail);
    setForgotPasswordFeedback(null);
    setIsForgotPasswordOpen(true);
  };

  return {
    register,
    handleSubmit: rhfHandleSubmit(onSubmit),
    errors,
    isSubmitting,
    showPassword,
    setShowPassword,
    submissionFeedback,
    setSubmissionFeedback,
    isForgotPasswordOpen,
    setIsForgotPasswordOpen,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordFeedback,
    openForgotPasswordModal,
    handleForgotPasswordSubmit,
  };
}
