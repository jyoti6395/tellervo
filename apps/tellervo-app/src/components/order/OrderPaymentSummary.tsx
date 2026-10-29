import React, { useState } from 'react';
import { CreditCard, Sparkles, Download, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OrderPaymentSummaryProps {
  orderNumber: string;
  total: number;
  paymentMethod?: string;
  shippingFee?: number;
}

export const OrderPaymentSummary: React.FC<OrderPaymentSummaryProps> = ({
  orderNumber,
  total,
  paymentMethod,
  shippingFee = 0,
}) => {
  const { showToast } = useApp();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const earnedSeeds = Math.round(total);
  const displayPaymentMethod = paymentMethod || 'Standard Payment Method';

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      setIsDownloadingPdf(false);
      showToast(`Invoice PDF downloaded for ${orderNumber}`, 'success');
    }, 800);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-soft-sm space-y-3">
      <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-[#988151]" />
        <span>Payment & Receipt</span>
      </h3>

      <div className="space-y-2 text-xs pt-1">
        <div className="flex justify-between text-[#687B6D]">
          <span>Provisions Subtotal</span>
          <span className="font-medium text-[#183122]">€{total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-[#687B6D]">
          <span>Delivery / Freight</span>
          <span className="font-semibold text-[#285737]">
            {shippingFee === 0 ? 'FREE (Complimentary)' : `€${shippingFee.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-[#967B48]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Patron Harvest Seeds Earned</span>
          </span>
          <span className="font-bold">+{earnedSeeds} Seeds</span>
        </div>

        <div className="flex justify-between text-[#687B6D]">
          <span>Payment Method</span>
          <span className="font-medium text-[#183122] capitalize">{displayPaymentMethod}</span>
        </div>

        <div className="pt-2.5 border-t border-[#F0EBE0] flex justify-between text-sm font-bold text-[#14261B]">
          <span>Total Paid (incl. VAT)</span>
          <span className="font-editorial text-base font-bold text-[#183324]">
            €{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Download PDF Receipt Action */}
      <button
        onClick={handleDownloadPdf}
        disabled={isDownloadingPdf}
        className="w-full py-2.5 bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-[#E5DFD0] rounded-xl text-xs font-semibold text-[#183122] flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
      >
        {isDownloadingPdf ? (
          <>
            <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#183324]" />
            <span>Generating Invoice PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-[#8F7440]" />
            <span>Download Tax Invoice / Receipt (PDF)</span>
          </>
        )}
      </button>
    </div>
  );
};
