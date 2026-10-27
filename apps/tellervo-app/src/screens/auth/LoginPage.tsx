import React from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  LogIn,
  KeyRound,
  X
} from 'lucide-react';
import { navigateTo, AUTH_ROUTES } from '../../routes/authRoutes';
import { useLoginForm } from './hooks/useLoginForm';

export const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    showPassword,
    setShowPassword,
    submissionFeedback,
    isForgotPasswordOpen,
    setIsForgotPasswordOpen,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordFeedback,
    openForgotPasswordModal,
    handleForgotPasswordSubmit,
  } = useLoginForm();

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
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#617467] mt-1">
              Sign in to access your subscriptions, saved favorites & Seeds
            </p>
          </div>

          {/* Status / Feedback Banner */}
          {submissionFeedback && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-900">Authentication Error</div>
                <div className="text-[11px] leading-relaxed mt-0.5 text-rose-700">
                  {submissionFeedback}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Address */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#23382A] mb-1.5"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A8E80]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@nordicbotanicals.com"
                  {...register('email')}
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white text-xs sm:text-sm text-[#183324] placeholder:text-[#9AA89E] rounded-xl border transition-all outline-none ${errors.email
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-[#E0D8C8] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
                    }`}
                />
              </div>
              {errors.email?.message && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#23382A]"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-[11px] font-medium text-[#A67C37] hover:text-[#8D6425] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A8E80]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
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
              {errors.password?.message && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="login-remember"
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-[#D8CEBC] text-[#183324] focus:ring-[#183324]/20 cursor-pointer"
              />
              <label htmlFor="login-remember" className="text-xs text-[#5D6F62] cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#183324] hover:bg-[#234833] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#E5A953]" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Navigation to Signup */}
          <div className="mt-6 pt-5 border-t border-[#EAE3D4] text-center">
            <p className="text-xs text-[#5F7265]">
              New to Tellervo Botanicals?{' '}
              <button
                type="button"
                onClick={() => navigateTo(AUTH_ROUTES.SIGNUP)}
                className="font-bold text-[#183324] hover:underline underline-offset-2 ml-1 cursor-pointer"
              >
                Create an Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#849487] mt-4">
          Tellervo Drinks Oy • Pure Nordic Botanical Elixirs & Sparkling Spritzes
        </p>
      </div>

      {/* Forgot Password Modal (Temporary flow) */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsForgotPasswordOpen(false)}
            className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm animate-in fade-in duration-200"
          />
          <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] text-[#183324] flex items-center justify-center border border-[#D5E5DB]">
                <KeyRound className="w-5 h-5 text-[#245C37]" />
              </div>
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#EBE6DC] text-[#637568] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-editorial text-xl font-medium text-[#14261B] mb-1">
              Reset Your Password
            </h3>
            <p className="text-xs text-[#637568] mb-4">
              Enter your email address and we'll transmit a secure reset link to your patron account.
            </p>

            {forgotPasswordFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-[#EBF4EE] border border-[#C5DDD0] text-[11px] text-[#1D4A2D]">
                {forgotPasswordFeedback}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#23382A] mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  placeholder="name@nordicbotanicals.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white text-xs text-[#183324] placeholder:text-[#9AA89E] rounded-xl border border-[#E0D8C8] focus:border-[#183324] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#183324] hover:bg-[#234833] text-white text-xs font-semibold rounded-xl shadow-soft transition-all"
                >
                  Send Recovery Link
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2.5 bg-[#EDE8DE] hover:bg-[#E2DDD3] text-[#293E30] text-xs font-semibold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
