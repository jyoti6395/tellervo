import React, { useState } from 'react';
import { Truck,
  CheckCircle2,
  Check,
  Copy,
  XCircle,
  RotateCcw,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OrderStatusCardProps {
  orderNumber: string;
  date: string;
  statusType: 'in-transit' | 'delivered';
  courier?: string;
  trackingId?: string;
  status?: string;
  statusMessage?: string;
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  orderNumber,
  date,
  statusType,
  courier = 'Subarctic Eco Dispatch',
  trackingId,
  status,
  statusMessage,
}) => {
  const { showToast } = useApp();
  const [isCopied, setIsCopied] = useState(false);

  const rawStatus = (status || '').toLowerCase().trim();


  const handleCopyTracking = () => {
    if (!trackingId) return;
    navigator.clipboard?.writeText(trackingId);
    setIsCopied(true);
    showToast('Tracking number copied to clipboard', 'info');
    setTimeout(() => setIsCopied(false), 2200);
  };

  // Determine styling and messaging according to the actual order status
  const isCancelled = rawStatus === 'cancelled' || rawStatus === 'canceled';
  const isRefunded = rawStatus === 'refunded';
  const isProcessing =
    rawStatus === 'in progress' ||
    rawStatus === 'processing' ||
    rawStatus === 'in_progress';
  const isPending = rawStatus === 'pending';
  const isDelivered =
    statusType === 'delivered' ||
    rawStatus === 'completed' ||
    rawStatus === 'delivered';

  const getStatusView = () => {
    if (isCancelled) {
      return {
        headerBadge: 'Order Cancelled',
        pillClass: 'bg-[#FDF2F2] border border-[#F8D7DA] text-[#9B1C1C]',
        pillContent: (
          <>
            <XCircle className="w-3.5 h-3.5 text-[#9B1C1C]" />
            <span>Cancelled</span>
          </>
        ),
        iconBoxClass: 'bg-[#FDF2F2] border border-[#F8D7DA] text-[#9B1C1C]',
        icon: <XCircle className="w-5 h-5 text-[#9B1C1C]" />,
        cardTitle: 'Order Cancelled',
        cardSubtitle:
          statusMessage || 'Payment was declined or the order was cancelled',
      };
    }

    if (isRefunded) {
      return {
        headerBadge: 'Order Refunded',
        pillClass: 'bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE]',
        pillContent: (
          <>
            <RotateCcw className="w-3.5 h-3.5 text-[#7E22CE]" />
            <span>Refunded</span>
          </>
        ),
        iconBoxClass: 'bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE]',
        icon: <RotateCcw className="w-5 h-5 text-[#7E22CE]" />,
        cardTitle: 'Payment Refunded',
        cardSubtitle:
          statusMessage || 'Payment has been refunded to your original payment method',
      };
    }

    if (isProcessing) {
      return {
        headerBadge: 'Order Confirmed',
        pillClass: 'bg-[#FEF7EC] border border-[#F5E4C4] text-[#9A6218]',
        pillContent: (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{status || 'Processing'}</span>
          </>
        ),
        iconBoxClass: 'bg-[#183324] text-[#E5A953]',
        icon: <Truck className="w-5 h-5" />,
        cardTitle: courier,
        cardSubtitle: statusMessage || 'The store is preparing the order',
      };
    }

    if (isPending) {
      return {
        headerBadge: 'Order Pending',
        pillClass: 'bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563]',
        pillContent: (
          <>
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>{status || 'Pending'}</span>
          </>
        ),
        iconBoxClass: 'bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563]',
        icon: <Clock className="w-5 h-5 text-[#4B5563]" />,
        cardTitle: 'Pending Confirmation',
        cardSubtitle:
          statusMessage || 'Awaiting payment confirmation before dispatch',
      };
    }

    if (isDelivered) {
      return {
        headerBadge: 'Order Confirmed',
        pillClass: 'bg-[#EAF3ED] border border-[#CFE2D4] text-[#1E5230]',
        pillContent: (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>{status || 'Delivered'}</span>
          </>
        ),
        iconBoxClass: 'bg-[#EAF3ED] border border-[#CFE2D4] text-[#1E5230]',
        icon: <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
        cardTitle: courier,
        cardSubtitle:
          statusMessage || 'Delivered to designated drop location',
      };
    }

    // Default: In Transit / Dispatch
    return {
      headerBadge: 'Order Confirmed',
      pillClass: 'bg-[#EAF3ED] border border-[#CFE2D4] text-[#1E5230]',
      pillContent: (
        <>
          <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
          <span>{status || 'In Transit'}</span>
        </>
      ),
      iconBoxClass: 'bg-[#183324] text-[#E5A953]',
      icon: <Truck className="w-5 h-5" />,
      cardTitle: courier,
      cardSubtitle: statusMessage || `Dispatched via ${courier}`,
    };
  };

  const statusView = getStatusView();

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-soft-sm relative overflow-hidden space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#988151] uppercase mb-0.5">
            {statusView.headerBadge}
          </div>
          <h1 className="font-editorial text-2xl font-bold text-[#14261B]">
            {orderNumber}
          </h1>
          <p className="text-xs text-[#6C7E71] mt-0.5">
            {date ? `Placed on ${date}` : statusView.headerBadge} • Carbon-Neutral Cold Chain
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          

          {/* Delivery Status Pill */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${statusView.pillClass}`}
          >
            {statusView.pillContent}
          </div>
        </div>
      </div>

      {/* Courier / Status dispatch card */}
      <div className="bg-[#FAF7F0] border border-[#EBE3D3] rounded-2xl p-3.5 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${statusView.iconBoxClass}`}>
          {statusView.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#183122] truncate">
            {statusView.cardTitle}
          </div>
          <div className="text-[11px] text-[#55695B] truncate">
            {statusView.cardSubtitle}
          </div>
        </div>
      </div>

      {/* Tracking Code Copy Pill */}
      {trackingId && !isCancelled && (
        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs">
          <div className="flex items-center gap-1.5 text-[#637568]">
            <span>Tracking ID:</span>
            <span className="font-mono font-semibold text-[#183122]">{trackingId}</span>
          </div>

          <button
            onClick={handleCopyTracking}
            className="flex items-center gap-1 text-[11px] font-bold text-[#2A5E3A] hover:text-[#183324] px-2.5 py-1 rounded-lg bg-[#EAF3ED] hover:bg-[#D9EADB] transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-[#2E7D32]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
