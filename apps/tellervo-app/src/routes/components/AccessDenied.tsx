import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { navigateTo } from '../hooks/useNavigation';
import { APP_ROUTES } from '../routes.config';

interface AccessDeniedProps {
  requiredRole?: string[];
}

/**
 * Access Denied UI Component
 * Rendered when authenticated user does not have permission for a role-restricted route.
 */
export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole }) => {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1B2B20] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-[#EBE6DC] text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7 text-[#A67C37]" />
        </div>

        <h1 className="font-editorial text-2xl font-medium tracking-tight text-[#14261B] mb-2">
          Patron Privilege Required
        </h1>

        <p className="text-xs text-[#617467] leading-relaxed mb-6">
          This cellar section is restricted to {requiredRole?.join(' or ') || 'authorized'} patrons.
          Please check your account permissions or sign in with an elevated patron profile.
        </p>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => navigateTo(APP_ROUTES.HOME.path)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#183324] hover:bg-[#234833] text-white text-xs font-semibold shadow-soft flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cellar Home</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo(APP_ROUTES.LOGIN.path)}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F2ECE1] border border-[#E0D8C8] text-[#183324] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-[#A67C37]" />
            <span>Sign In with Another Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
