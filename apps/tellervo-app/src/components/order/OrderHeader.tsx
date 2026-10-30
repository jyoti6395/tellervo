import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigation } from '../../routes/hooks/useNavigation';
import { useApp } from '../../context/AppContext';

interface OrderHeaderProps {
  orderId: string;
  orderNumber: string;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ orderId, orderNumber }) => {
  const { navigate } = useNavigation();
  const { showToast } = useApp();

  return (
    <header className="flex items-center justify-between pt-1">
      <button
        onClick={() => navigate('/profile')}
        aria-label="Back to Account"
        className="w-9 h-9 rounded-full bg-white border border-[#E5DFD0] flex items-center justify-center text-[#1C3224] hover:bg-[#F6F3EB] active:scale-95 transition-all shadow-xs"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center text-center">
        <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase">
          FOREST DISPATCH
        </span>
        <span className="font-editorial text-sm font-semibold text-[#14261B]">
          {orderNumber}
        </span>
      </div>

      <div className="w-9 h-9" />
    </header>
  );
};

