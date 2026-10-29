import React from 'react';
import { ChevronLeft, Share2 } from 'lucide-react';
import { useNavigation } from '../../routes/hooks/useNavigation';
import { useApp } from '../../context/AppContext';

interface OrderHeaderProps {
  orderId: string;
  orderNumber: string;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ orderId, orderNumber }) => {
  const { navigate } = useNavigation();
  const { showToast } = useApp();

  const handleShare = () => {
    const url = `${window.location.origin}/orders/${orderId}`;
    if (navigator.share) {
      navigator.share({
        title: `Tellervo Order ${orderNumber}`,
        text: `Live tracking and receipt for Tellervo Order ${orderNumber}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      showToast('Order details link copied to clipboard!');
    }
  };

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

      <button
        onClick={handleShare}
        aria-label="Share order details"
        className="w-9 h-9 rounded-full bg-white border border-[#E5DFD0] flex items-center justify-center text-[#1C3224] hover:bg-[#F6F3EB] active:scale-95 transition-all shadow-xs"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </header>
  );
};

