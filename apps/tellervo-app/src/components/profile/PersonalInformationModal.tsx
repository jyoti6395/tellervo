import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalInformationModal: React.FC<PersonalInformationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, authUser, updateUserProfile, showToast } = useApp();

  const [fullName, setFullName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || authUser?.phone || '+358 40 123 4567');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please provide your name', 'info');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: fullName.trim(),
        phone: phone.trim(),
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
              onChange={e => setFullName(e.target.value)}
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

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-[#183122] mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#5B7161]" />
              <span>Mobile Phone</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+358 40 123 4567"
              className="w-full bg-white rounded-xl border border-[#DED7C9] px-3.5 py-2.5 text-xs text-[#14261B] focus:outline-none focus:ring-2 focus:ring-[#183324]/20 focus:border-[#183324] transition-all"
            />
            <p className="text-[10px] text-[#869689] mt-1">
              Used by Posti Eco for delivery SMS alerts & locker PINs.
            </p>
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
