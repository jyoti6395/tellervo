import React from 'react';
import { Package } from 'lucide-react';
import { useNavigation } from '../../routes/hooks/useNavigation';

export const OrderNotFound: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-[#F4EFE6] border border-[#E5DFD0] flex items-center justify-center text-[#183324] mb-4 shadow-soft-sm">
        <Package className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h2 className="font-editorial text-2xl font-bold text-[#14261B] mb-2">
        Forest Order Not Found
      </h2>
      <p className="text-xs text-[#5D6F61] max-w-xs mb-6 leading-relaxed">
        We could not locate this order in your cellar archives. Please check your order reference number or return to your account.
      </p>
      <button
        onClick={() => navigate('/profile')}
        className="px-6 py-3 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-2xl hover:bg-[#254632] active:scale-95 transition-all shadow-md"
      >
        View Account Orders
      </button>
    </div>
  );
};

