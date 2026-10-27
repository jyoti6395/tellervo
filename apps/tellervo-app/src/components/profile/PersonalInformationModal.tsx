import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import type { CountryCode } from 'libphonenumber-js';
import { useApp } from '../../context/AppContext';
import { PhoneInputWithCountry } from '../common/PhoneInputWithCountry';
import {
  validatePhoneNumber,
  normalizePhoneNumber,
  detectCountryFromPhone,
  getNationalNumberWithoutCallingCode,
} from '../../utils/phoneUtils';

interface PersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalInformationModal: React.FC<PersonalInformationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, authUser, updateUserProfile, showToast } = useApp();

  const initialPhone = user.phone || authUser?.phone || '';
  const initialCountry = detectCountryFromPhone(initialPhone) || 'FI';

  const [fullName, setFullName] = useState(user.name);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountry);
  const [phone, setPhone] = useState(() =>
    getNationalNumberWithoutCallingCode(initialPhone, initialCountry)
  );
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = user.phone || authUser?.phone || '';
      const c = detectCountryFromPhone(current) || 'FI';
      setSelectedCountry(c);
      setFullName(user.name);
      setPhone(getNationalNumberWithoutCallingCode(current, c));
      setPhoneError(undefined);
    }
  }, [isOpen, user.name, user.phone, authUser?.phone]);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (val.trim()) {
      const res = validatePhoneNumber(val, selectedCountry);
      setPhoneError(res.isValid ? undefined : res.error);
    } else {
      setPhoneError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please provide your name', 'info');
      return;
    }

    if (phone.trim()) {
      const res = validatePhoneNumber(phone, selectedCountry);
      if (!res.isValid) {
        setPhoneError(res.error || 'Please enter a valid phone number');
        showToast(res.error || 'Please enter a valid phone number', 'info');
        return;
      }
    }

    setIsSaving(true);
    try {
      const normalizedPhone = phone.trim()
        ? normalizePhoneNumber(phone, selectedCountry) || phone.trim()
        : '';

      await updateUserProfile({
        name: fullName.trim(),
        phone: normalizedPhone,
      });
      showToast('Personal information updated', 'success');
      onClose();
    } catch {
      showToast('Failed to save profile changes', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase block">
              PATRON PROFILE
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B]">
              Personal Information
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFECE2] flex items-center justify-center text-[#405445] hover:bg-[#E2DDD0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#183122] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#5B7161]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Freja Lindqvist"
              className="w-full bg-white rounded-xl border border-[#DED7C9] px-3.5 py-2.5 text-xs text-[#14261B] focus:outline-none focus:ring-2 focus:ring-[#183324]/20 focus:border-[#183324] transition-all"
            />
          </div>

          {/* Email (Read-Only) */}
          <div>
            <label className="block text-xs font-bold text-[#183122] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#5B7161]" />
                <span>Email Address</span>
              </span>
              <span className="text-[10px] text-[#718274] font-medium flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Verified
              </span>
            </label>
            <input
              type="email"
              disabled
              value={authUser?.email || `${user.handle || 'patron'}@tellervo.fi`}
              className="w-full bg-[#EFECE2]/70 rounded-xl border border-[#DED7C9] px-3.5 py-2.5 text-xs text-[#637568] cursor-not-allowed select-none"
            />
            <p className="text-[10px] text-[#869689] mt-1">
              Email is your secure authentication identity.
            </p>
          </div>

          {/* Phone Number with Fixed Country Indicator (Disabled edit, only domestic number in input) */}
          <div>
            <PhoneInputWithCountry
              id="profile-phone"
              name="phone"
              label="Mobile Phone"
              value={phone}
              onChange={handlePhoneChange}
              selectedCountry={selectedCountry}
              disableCountryChange={true}
              error={phoneError}
              helperText="Used by Posti Eco for delivery SMS alerts & locker PINs."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-[#183324] hover:bg-[#234531] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E5A953]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-[#EFECE2] hover:bg-[#E5E0D3] text-[#293E30] text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
