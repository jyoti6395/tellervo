import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import type { CountryCode } from 'libphonenumber-js';
import { SUPPORTED_COUNTRIES, CountryConfig } from '../../config/countries.config';

interface CountrySelectModalProps {
  isOpen: boolean;
  selectedCountry: CountryCode;
  onSelect: (country: CountryConfig) => void;
  onClose: () => void;
}

export const CountrySelectModal: React.FC<CountrySelectModalProps> = ({
  isOpen,
  selectedCountry,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, 190);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  const handleSmoothClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const handleSelectCountry = (country: CountryConfig) => {
    setIsExiting(true);
    setTimeout(() => {
      onSelect(country);
      onClose();
    }, 140);
  };

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SUPPORTED_COUNTRIES;
    return SUPPORTED_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nativeName.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isRendered && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1D14]/70 backdrop-blur-sm transition-all ${
        isExiting ? 'animate-modal-backdrop-exit' : 'animate-modal-backdrop'
      }`}
      onClick={handleSmoothClose}
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-md bg-[#FBF9F5] border border-[#E8E2D4] rounded-3xl p-6 shadow-2xl text-[#14261B] overflow-hidden max-h-[85vh] flex flex-col ${
          isExiting ? 'animate-modal-card-exit' : 'animate-modal-card'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D8E6DC]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#EFE3CF]/50 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#EBE6DC] relative z-10 shrink-0">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase block">
              INTERNATIONAL REGISTRY
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B]">
              Select Country
            </h3>
            <p className="text-xs text-[#5D6F61] mt-0.5">
              Choose country dial code and domestic number format
            </p>
          </div>
          <button
            type="button"
            onClick={handleSmoothClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#EFECE2] hover:bg-[#E2DDD0] active:scale-95 text-[#405445] hover:text-[#183324] flex items-center justify-center transition-all shadow-soft-sm shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative my-3 shrink-0 z-10">
          <Search className="w-4 h-4 text-[#7A8E80] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country name or code (e.g. Finland, +358)..."
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DED7C9] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10 rounded-xl text-xs sm:text-sm text-[#14261B] placeholder:text-[#9AA89E] outline-none transition-all shadow-soft-sm"
          />
        </div>

        {/* Country List */}
        <div className="overflow-y-auto space-y-2 pr-1 my-1 flex-1 relative z-10 no-scrollbar">
          {filteredCountries.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7A8E80]">
              No country found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredCountries.map((c) => {
              const isSelected = selectedCountry === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    isSelected
                      ? 'bg-[#183324] border border-[#183324] text-white shadow-soft ring-1 ring-[#183324]'
                      : 'bg-white/80 hover:bg-white border border-[#E5DFD2] hover:border-[#183324]/40 text-[#14261B] shadow-soft-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 2-letter Country Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#244833] border border-[#2F5A3E] text-[#E5A953]'
                          : 'bg-[#F5F2EB] border border-[#E6E0D2] text-[#183324]'
                      }`}
                    >
                      {c.code}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isSelected ? 'text-white' : 'text-[#14261B]'
                          }`}
                        >
                          {c.name}
                        </span>
                        {c.code === 'FI' && (
                          <span
                            className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${
                              isSelected
                                ? 'bg-[#244833] text-[#E5A953] border border-[#2F5A3E]'
                                : 'bg-[#EAF3ED] border border-[#CFE2D4] text-[#246138]'
                            }`}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] block mt-0.5 ${
                          isSelected ? 'text-[#B2C7B8]' : 'text-[#718274]'
                        }`}
                      >
                        {c.nativeName} • {c.exampleNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border ${
                        isSelected
                          ? 'bg-[#244833] text-[#E5A953] border-[#2F5A3E]'
                          : 'bg-[#F5F2EB] text-[#183324] border-[#E6E0D2]'
                      }`}
                    >
                      {c.dialCode}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#E5A953] stroke-[2.5]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
