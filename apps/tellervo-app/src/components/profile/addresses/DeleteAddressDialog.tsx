import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { SavedAddress } from '../../../types/address';

interface DeleteAddressDialogProps {
  isOpen: boolean;
  address: SavedAddress | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

export const DeleteAddressDialog: React.FC<DeleteAddressDialogProps> = ({
  isOpen,
  address,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !address) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1D14]/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#FBF9F5] border border-[#E8E2D4] rounded-3xl p-6 shadow-2xl text-[#14261B] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 stroke-[1.8]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFECE2] hover:bg-[#E2DDD0] active:scale-95 text-[#405445] hover:text-[#183324] flex items-center justify-center transition-all shadow-soft-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <h4 className="font-editorial text-xl font-semibold text-[#14261B]">
          Remove Address?
        </h4>
        <p className="text-xs text-[#5D6F61] mt-1.5 leading-relaxed">
          Are you sure you want to remove{' '}
          <strong className="text-[#14261B] font-bold">
            {address.title || address.street}
          </strong>{' '}
          from your saved delivery destinations?
        </p>

        {address.isDefault && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
            <span>This is currently your default delivery destination.</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onConfirm(address.id);
              onClose();
            }}
            className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 active:scale-98 text-white text-xs font-semibold rounded-xl transition-all shadow-soft-sm"
          >
            Remove Address
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-[#EFECE2] hover:bg-[#E5E0D3] active:scale-98 text-[#293E30] text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
