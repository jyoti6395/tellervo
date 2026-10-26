import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trees,
  Loader2
} from 'lucide-react';
import {
  SignupFormData,
  ValidationErrors,
  validateSignupForm
} from '../../lib/authValidation';
import { navigateTo, AUTH_ROUTES } from '../../routes/authRoutes';
import { useApp } from '../../context/AppContext';

export const SignupPage: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1B2B20] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Ambient Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#D8E6DC] blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#EFE3CF] blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Navigation Back to Store */}
        <div className="mb-4 flex items-center">
          <button
            type="button"
            onClick={() => navigateTo(AUTH_ROUTES.HOME)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E5645] hover:text-[#183324] px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#E4DECFA0] hover:bg-white shadow-soft-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-[#EBE6DC] relative overflow-hidden">
          {/* Top Subtle Forest Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#183324] via-[#2F5A3E] to-[#E5A953]" />

          {/* Header & Brand */}
          <div className="text-center mb-6 pt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-soft-sm border border-[#E8E2D5] p-2 mb-3">
              <img
                src="/tellervo-logo.png"
                alt="Tellervo Official Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#14261B]">
              Join the Boreal Cellar
            </h1>
            <p className="text-xs sm:text-sm text-[#617467] mt-1">
              Create your patron account for wild harvest drops & seed rewards
            </p>
          </div>

          {/* Status / Feedback Banner */}
          {submissionFeedback && (
            <div
              role="alert"
              className={`mb-5 p-3.5 rounded-2xl ${
                isSuccessNotice
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              } text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200`}
            >
              {isSuccessNotice ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className={`font-bold ${isSuccessNotice ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {isSuccessNotice ? 'Verification Email Dispatched' : 'Registration Notice'}
                </div>
                <div
                  className={`text-[11px] leading-relaxed mt-0.5 ${
                    isSuccessNotice ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {submissionFeedback}
                </div>
                {submissionFeedback.includes('rate limit') && (
                  <a
                    href="https://supabase.com/dashboard/project/alextavpyuifokaoyxkv/auth/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-semibold transition-colors"
                  >
                    <span>Open Supabase Auth Settings</span>
                    <span>→</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="signup-fullname"
                className="block text-xs font-semibold text-[#23382A] mb-1.5"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A8E80]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="signup-fullname"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Milla Virtanen"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white text-xs sm:text-sm text-[#183324] placeholder:text-[#9AA89E] rounded-xl border transition-all outline-none ${errors.fullName
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-[#E0D8C8] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
                    }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold text-[#23382A] mb-1.5"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A8E80]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@nordicbotanicals.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white text-xs sm:text-sm text-[#183324] placeholder:text-[#9AA89E] rounded-xl border transition-all outline-none ${errors.email
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-[#E0D8C8] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="signup-phone"
                className="block text-xs font-semibold text-[#23382A] mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A8E80]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="e.g. +358 40 123 4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white text-xs sm:text-sm text-[#183324] placeholder:text-[#9AA89E] rounded-xl border transition-all outline-none ${errors.phone
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-[#E0D8C8] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-[#23382A]"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-[#78887C]">Min. 8 characters</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A8E80]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white text-xs sm:text-sm text-[#183324] placeholder:text-[#9AA89E] rounded-xl border transition-all outline-none ${errors.password
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-[#E0D8C8] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A8E80] hover:text-[#183324]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-semibold text-[#23382A] mb-1.5"
              >
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A8E80]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white text-xs sm:text-sm text-[#183324] placeholder:text-[#9AA89E] rounded-xl border transition-all outline-none ${errors.confirmPassword
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-[#E0D8C8] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A8E80] hover:text-[#183324]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Patron Perks Mini Pill */}
            <div className="p-3 bg-[#F4EFE6]/70 rounded-xl border border-[#E9E1D2] flex items-center gap-2.5 text-[11px] text-[#415647]">
              <Trees className="w-4 h-4 text-[#2C623C] shrink-0" />
              <span>Includes 50 bonus Seeds & priority cold-chain harvest reservations</span>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#183324] hover:bg-[#234833] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating details...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E5A953]" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Navigation to Login */}
          <div className="mt-6 pt-5 border-t border-[#EAE3D4] text-center">
            <p className="text-xs text-[#5F7265]">
              Already have a patron cellar account?{' '}
              <button
                type="button"
                onClick={() => navigateTo(AUTH_ROUTES.LOGIN)}
                className="font-bold text-[#183324] hover:underline underline-offset-2 ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#849487] mt-4">
          Tellervo Drinks Oy • Pure Nordic Botanical Elixirs & Sparkling Spritzes
        </p>
      </div>
    </div>
  );
};
