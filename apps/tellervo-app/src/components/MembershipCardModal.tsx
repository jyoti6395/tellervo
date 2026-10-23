import React from 'react';
import { useApp } from '../context/AppContext';
import { X, QrCode, Trees, Sparkles, ShieldCheck } from 'lucide-react';

export const MembershipCardModal: React.FC = () => {
  const { isMembershipCardOpen, setIsMembershipCardOpen, user } = useApp();

  if (!isMembershipCardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => setIsMembershipCardOpen(false)}
        className="fixed inset-0 bg-[#0E1D14]/75 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-xs bg-[#16291D] rounded-3xl p-6 shadow-2xl border border-[#2B4A34] text-white z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsMembershipCardOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#E5A953] hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Card Header with Official Tellervo Goddess Logo */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full bg-white p-0.5 border border-[#E5A953]/50 flex items-center justify-center overflow-hidden shrink-0 shadow">
            <img src="/tellervo-logo.png" alt="Tellervo Drinks" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-[#E5A953] uppercase font-bold">
              TELLERVO DRINKS • FOREST CLUB
            </div>
            <div className="text-xs text-[#A8C4B1]">Digital Forager Pass • Luonnon Rohdot</div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white rounded-2xl p-4 my-4 flex flex-col items-center justify-center shadow-inner">
          <div className="w-44 h-44 bg-neutral-900 rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
            {/* Realistic stylized QR pattern */}
            <div className="w-full h-full bg-white p-2 rounded-lg flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-10 h-10 border-4 border-black p-1 flex items-center justify-center">
                  <div className="w-4 h-4 bg-black" />
                </div>
                <div className="grid grid-cols-4 gap-1 p-1">
                  <div className="w-2 h-2 bg-black" />
                  <div className="w-2 h-2 bg-black" />
                  <div className="w-2 h-2 bg-black" />
                </div>
                <div className="w-10 h-10 border-4 border-black p-1 flex items-center justify-center">
                  <div className="w-4 h-4 bg-black" />
                </div>
              </div>
              <div className="flex items-center justify-center my-2">
                <div className="w-9 h-9 rounded-full bg-[#16291D] flex items-center justify-center text-[#E5A953] shadow">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <div className="flex justify-between">
                <div className="w-10 h-10 border-4 border-black p-1 flex items-center justify-center">
                  <div className="w-4 h-4 bg-black" />
                </div>
                <div className="grid grid-cols-3 gap-1 p-1">
                  <div className="w-2 h-2 bg-black" />
                  <div className="w-2 h-2 bg-black" />
                </div>
                <div className="w-8 h-8 bg-black/10 rounded flex items-center justify-center text-[8px] font-mono text-black font-bold">
                  PASS
                </div>
              </div>
            </div>
          </div>
          <span className="font-mono text-xs tracking-wider text-[#16291D] font-bold mt-2.5">
            TL-PATRON-680-FL
          </span>
          <span className="text-[10px] text-[#7A8C7F]">Scan at Helsinki Forest Bar & Tasting Lab</span>
        </div>

        {/* Member Details */}
        <div className="space-y-1.5 text-xs text-[#BED4C5] mb-4">
          <div className="flex justify-between">
            <span>Patron</span>
            <span className="font-semibold text-white">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Harvest Tier</span>
            <span className="text-[#E5A953] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {user.tier}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Available Seeds</span>
            <span className="font-bold text-white">{user.seeds} Seeds</span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-[#A6C0AF]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E5A953]" />
          <span>Active Boreal Member • Tap to close</span>
        </div>
      </div>
    </div>
  );
};
