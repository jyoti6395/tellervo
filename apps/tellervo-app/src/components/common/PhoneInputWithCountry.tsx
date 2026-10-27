import React, { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import type { CountryCode } from 'libphonenumber-js';
import { CountryConfig, getCountryByCode } from '../../config/countries.config';
import { CountrySelectModal } from './CountrySelectModal';
import { formatAsYouType, detectCountryFromPhone } from '../../utils/phoneUtils';

export interface PhoneInputWithCountryProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  selectedCountry: CountryCode;
  onCountryChange?: (country: CountryConfig) => void;
  error?: string;
  disabled?: boolean;
  disableCountryChange?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  id = 'phone-input',
  name = 'phone',
  value,
  onChange,
  selectedCountry,
  onCountryChange,
  error,
  disabled = false,
  disableCountryChange = false,
  required = false,
  label,
  helperText,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentCountry = getCountryByCode(selectedCountry);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;

    if (disableCountryChange) {
      // If country change is disabled, strip any typed or pasted international dial code
      if (rawVal.startsWith(currentCountry.dialCode)) {
        rawVal = rawVal.slice(currentCountry.dialCode.length).trim();
      } else if (rawVal.startsWith('+')) {
        rawVal = rawVal.replace(/^\+\d{1,4}\s*/, '');
      }
    } else {
      // Check if user entered an international prefix from another country
      if (rawVal.startsWith('+')) {
        const detected = detectCountryFromPhone(rawVal);
        if (detected && detected !== selectedCountry && onCountryChange) {
          onCountryChange(getCountryByCode(detected));
        }
      }
    }

    // Format input gracefully as the user types
    const formatted = formatAsYouType(rawVal, selectedCountry);
    onChange(formatted);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[#23382A] mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Unified Input Container: exact same border, radius and height as all other inputs */}
      <div
        className={`relative flex items-stretch w-full bg-white rounded-xl border transition-all overflow-hidden ${
          error
            ? 'border-rose-400 ring-2 ring-rose-200'
            : 'border-[#E0D8C8] focus-within:border-[#183324] focus-within:ring-2 focus-within:ring-[#183324]/10'
        }`}
      >
        {/* Country selector trigger pill */}
        <button
          type="button"
          disabled={disabled || disableCountryChange}
          onClick={() => {
            if (!disableCountryChange) {
              setIsModalOpen(true);
            }
          }}
          title={
            disableCountryChange
              ? `Country calling code: ${currentCountry.name} (${currentCountry.dialCode})`
              : `Selected country: ${currentCountry.name} (${currentCountry.dialCode}). Click to change.`
          }
          className={`inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-2.5 bg-[#FAF8F5] border-r border-[#E0D8C8] text-xs font-semibold text-[#183324] shrink-0 select-none ${
            disableCountryChange
              ? 'cursor-default'
              : 'hover:bg-[#F2ECE0] active:scale-95 active:bg-[#EAE4D4] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:pointer-events-none'
          }`}
        >
          <span className="text-xs font-bold text-[#183324] tracking-tight leading-none inline-flex items-center">
            {currentCountry.code}
          </span>
          <span className="text-xs text-[#3E5645] font-semibold leading-none inline-flex items-center">
            {currentCountry.dialCode}
          </span>
          {!disableCountryChange && (
            <ChevronDown className="w-3.5 h-3.5 text-[#7A8E80] shrink-0" />
          )}
        </button>

        {/* Formatted phone input */}
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder={`e.g. ${currentCountry.exampleNumber}`}
          className="w-full pl-3 pr-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-[#183324] placeholder:text-[#9AA89E] outline-none border-none"
        />
      </div>

      {/* Helper text or error message */}
      {error ? (
        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-[#7A8E80]">{helperText}</p>
      ) : null}

      {/* Modal Dialog */}
      {!disableCountryChange && (
        <CountrySelectModal
          isOpen={isModalOpen}
          selectedCountry={selectedCountry}
          onSelect={(country) => {
            if (onCountryChange) {
              onCountryChange(country);
            }
            // If a number was already typed, re-format with the new country
            if (value) {
              onChange(formatAsYouType(value, country.code));
            }
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
