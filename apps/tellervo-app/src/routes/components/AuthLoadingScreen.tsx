import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Branded Nordic Loading Screen
 * Shown while Supabase auth session is hydrating. Prevents layout flashes.
 */
export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1B2B20] flex flex-col items-center justify-center p-4">
      {/* Ambient background blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#D8E6DC] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#EFE3CF] blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
        {/* Brand Logo */}
        <div className="w-16 h-16 rounded-2xl bg-white shadow-soft-sm border border-[#E8E2D5] p-2.5 mb-4 flex items-center justify-center animate-pulse">
          <img
            src="/tellervo-logo.png"
            alt="Tellervo Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <h2 className="font-editorial text-2xl font-medium tracking-tight text-[#14261B] mb-1">
          Tellervo Cellar
        </h2>
        <p className="text-xs text-[#617467] mb-6">
          Verifying patron credentials & cellar vault...
        </p>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E0D8C8] text-xs font-medium text-[#2E4F39] shadow-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E5A953]" />
          <span>Synchronizing session</span>
        </div>
      </div>
    </div>
  );
};
