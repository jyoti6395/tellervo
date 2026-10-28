import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .max(254, 'Email address cannot exceed 254 characters.')
    .regex(EMAIL_REGEX, 'Please enter a valid email address (e.g. admin@tellervo.com).'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(6, 'Password must be at least 6 characters.'),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAdmin, loading: authLoading } = useAuth();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  // Redirect already-authenticated admin to dashboard
  useEffect(() => {
    if (!authLoading && isAdmin) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAdmin, authLoading, navigate, location]);

  const onSubmit = async (data: AdminLoginFormValues) => {
    setErrorMsg(null);

    try {
      const result = await login(data.email, data.password);
      if (!result.success) {
        setErrorMsg(result.error ?? 'Invalid email or password combination.');
        return;
      }
      toast.success('Welcome back to Tellervo Admin Portal');
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch {
      setErrorMsg('Invalid email or password combination.');
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background text-foreground font-sans">
      {/* Left - Login Form */}
      <div className="relative flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-24 bg-background border-r border-border py-12">

        {/* Brand mark - matches AdminSidebar style */}
        <div className="absolute top-8 left-8 sm:top-10 sm:left-12 flex items-center gap-3 select-none">
          <div className="w-9 h-9 rounded-full bg-white/95 border border-[#dca038]/40 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            <img src="/tellervo-logo.png" alt="Tellervo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[17px] font-bold tracking-[0.14em] text-foreground leading-none">
              TELLERVO
            </span>
            <span className="text-[9.5px] font-medium tracking-[0.24em] text-muted-foreground uppercase mt-1 leading-none">
              ADMIN PANEL
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-sm lg:max-w-md space-y-6 mt-16 sm:mt-10">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Enter your email below to login to your account
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-3 bg-destructive/10 text-destructive text-sm p-3.5 rounded-xl border border-destructive/25 animate-in fade-in duration-200">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span className="font-medium leading-snug">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground font-sans">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                {...register('email')}
                className={`w-full h-11 px-3.5 rounded-xl border bg-card text-foreground text-sm font-sans outline-none transition-all placeholder:text-muted-foreground ${
                  errors.email
                    ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                    : 'border-border focus:border-[#183626] focus:ring-2 focus:ring-[#183626]/20 dark:focus:border-[#dca038] dark:focus:ring-[#dca038]/20'
                }`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive mt-1 animate-in fade-in duration-150">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground font-sans">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Please contact your administrator to reset credentials.')}
                  className="text-xs font-medium text-[#183626] dark:text-[#dca038] hover:underline cursor-pointer font-sans"
                >
                  Forgot your password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
                className={`w-full h-11 px-3.5 rounded-xl border bg-card text-foreground text-sm font-sans outline-none transition-all placeholder:text-muted-foreground ${
                  errors.password
                    ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                    : 'border-border focus:border-[#183626] focus:ring-2 focus:ring-[#183626]/20 dark:focus:border-[#dca038] dark:focus:ring-[#dca038]/20'
                }`}
              />
              {errors.password && (
                <p className="text-xs font-medium text-destructive mt-1 animate-in fade-in duration-150">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full h-11 text-sm font-semibold bg-[#183626] hover:bg-[#12281c] text-white dark:bg-[#dca038] dark:text-[#0d1a14] dark:hover:bg-[#c58d2e] rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-sans shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right - Hero visual */}
      <div className="hidden lg:block relative h-full w-full overflow-hidden bg-[#0d1a14]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-1000 ease-in-out"
          style={{ backgroundImage: 'url("/tellervo-login-bg.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a12]/95 via-[#0b1a12]/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white select-none">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 leading-tight text-white font-sans">
            Tellervo Beverage & Lounge Console
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg font-sans">
            Handcrafted botanical spirits, wild berry elixirs, and bespoke cellar reserves. Monitor live bar orders, manage vintage inventory, and orchestrate dining experiences in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
