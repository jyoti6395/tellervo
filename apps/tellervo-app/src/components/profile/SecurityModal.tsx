import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authService, supabase } from '@tellervo/supabase';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { authUser, user, showToast } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  if (!isOpen) return null;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'info');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'info');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        showToast(error.message || 'Failed to update password', 'info');
      } else {
        showToast('Password updated securely!', 'success');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }
    } catch {
      showToast('Error updating password', 'info');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendResetEmail = async () => {
    const email = authUser?.email || user.handle + '@tellervo.fi';
    setIsSendingReset(true);
    try {
      const res = await authService.resetPassword(email);
      if (res.success) {
        showToast(`Password recovery link dispatched to ${email}`, 'success');
      } else {
        showToast(res.error || 'Failed to send recovery link', 'info');
      }
    } catch {
      showToast('Failed to send recovery link', 'info');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase block">
              ACCOUNT PROTECTION
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B]">
              Login & Security
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

        <p className="text-xs text-[#5D6F61] mb-4">
          Manage your password and protected session authentication.
        </p>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#E5DFD2] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3ED] flex items-center justify-center text-[#183324]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#718274] font-medium block">Active Identity</span>
                <span className="text-xs font-bold text-[#14261B] truncate max-w-[190px] block">
                  {authUser?.email || `${user.handle || 'patron'}@tellervo.fi`}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#EAF3ED] text-[#246138] text-[9px] font-bold">
              Active
            </span>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordUpdate} className="bg-white rounded-2xl p-4 border border-[#E5DFD2] space-y-3">
            <div className="flex items-center gap-1.5 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-[#183324]" />
              <h4 className="text-xs font-bold text-[#14261B]">Change Password</h4>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5D6F61] mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#FAF8F3] rounded-xl border border-[#DED7C9] px-3 py-2 pr-9 text-xs text-[#14261B] focus:outline-none focus:border-[#183324]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-[#718274] hover:text-[#183324]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5D6F61] mb-1">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full bg-[#FAF8F3] rounded-xl border border-[#DED7C9] px-3 py-2 text-xs text-[#14261B] focus:outline-none focus:border-[#183324]"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2 bg-[#183324] hover:bg-[#254632] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E5A953]" />
                  <span>Save New Password</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Email Recovery */}
          <div className="bg-[#FAF7F0] rounded-2xl p-3.5 border border-[#E8E2D5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8C7443]" />
              <div className="text-xs">
                <span className="font-bold text-[#14261B] block">Forgot your password?</span>
                <span className="text-[10px] text-[#718274]">Dispatch a reset link to your email</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isSendingReset}
              className="px-2.5 py-1.5 bg-white border border-[#DED7C9] rounded-xl text-[11px] font-semibold text-[#183324] hover:bg-[#F3EFE6] transition-colors shrink-0"
            >
              {isSendingReset ? 'Sending...' : 'Send Link'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#EAE4D7] mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#254632] transition-colors"
          >
            Close Security
          </button>
        </div>
      </div>
    </div>
  );
};
