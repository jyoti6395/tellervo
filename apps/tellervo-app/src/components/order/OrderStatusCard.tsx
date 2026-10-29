import React, { useState } from 'react';
import { Bell, Truck, CheckCircle2, Check, Copy } from 'lucide-react';
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
  const { showToast, toggleRestockNotification, isRestockNotified } = useApp();
  const [isCopied, setIsCopied] = useState(false);
  const isInTransit = statusType === 'in-transit';

  const rawStatus = (status || '').toLowerCase().trim();
  const normalizedStatus = rawStatus.replace(/[\s_-]+/g, '');
  const isOutOfStock =
    normalizedStatus === 'outofstock' ||
    rawStatus === 'out of stock' ||
    rawStatus === 'out_of_stock' ||
    rawStatus === 'out-of-stock';
  const isLowStock =
    !isOutOfStock &&
    (normalizedStatus === 'lowstock' ||
      rawStatus === 'low stock' ||
      rawStatus === 'low_stock' ||
      rawStatus === 'low-stock');

  const handleCopyTracking = () => {
    if (!trackingId) return;
    navigator.clipboard?.writeText(trackingId);
    setIsCopied(true);
    showToast('Tracking number copied to clipboard', 'info');
    setTimeout(() => setIsCopied(false), 2200);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-soft-sm relative overflow-hidden space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#988151] uppercase mb-0.5">
            Order Confirmed
          </div>
          <h1 className="font-editorial text-2xl font-bold text-[#14261B]">
            {orderNumber}
          </h1>
          <p className="text-xs text-[#6C7E71] mt-0.5">
            {date ? `Placed on ${date}` : 'Order Confirmed'} • Carbon-Neutral Cold Chain
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {/* Stock Badge if Low Stock or Out of Stock */}
          {isOutOfStock ? (
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 bg-[#8B2525]/10 text-[#8B2525] border border-[#8B2525]/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
              <button
                type="button"
                onClick={() => toggleRestockNotification(orderNumber, orderNumber)}
                aria-label="Notify when active again"
                title={isRestockNotified(orderNumber) ? 'Restock notification active' : 'Notify when order items are active again'}
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  isRestockNotified(orderNumber)
                    ? 'bg-[#EBF4EE] border-[#C5DEC9] text-[#245D36]'
                    : 'bg-[#FAF4E8] border-[#ECD9B7] text-[#9A6218] hover:bg-[#F4ECDA]'
                }`}
              >
                <Bell className={`w-3 h-3 ${isRestockNotified(orderNumber) ? 'fill-[#245D36]' : ''}`} />
              </button>
            </div>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 bg-[#C97B1A]/10 text-[#C97B1A] border border-[#C97B1A]/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Limited Stock
            </span>
          ) : null}

          {/* Delivery Status Pill */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
              isInTransit
                ? 'bg-[#EAF3ED] border border-[#CFE2D4] text-[#1E5230]'
                : 'bg-[#F2EFE8] border border-[#E0D9C9] text-[#2F4435]'
            }`}
          >
            {isInTransit ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                <span>{status || 'In Transit'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{status || 'Delivered'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Courier dispatch card */}
      <div className="bg-[#FAF7F0] border border-[#EBE3D3] rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#183324] text-[#E5A953] flex items-center justify-center shrink-0 shadow-xs">
          <Truck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#183122] truncate">
            {courier}
          </div>
          <div className="text-[11px] text-[#55695B] truncate">
            {statusMessage || (isInTransit ? `Dispatched via ${courier}` : 'Delivered to designated drop location')}
          </div>
        </div>
      </div>

      {/* Tracking Code Copy Pill */}
      {trackingId && (
        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs">
          <div className="flex items-center gap-1.5 text-[#637568]">
            <span>Tracking ID:</span>
            <span className="font-mono font-semibold text-[#183122]">{trackingId}</span>
          </div>

          <button
            onClick={handleCopyTracking}
            className="flex items-center gap-1 text-[11px] font-bold text-[#2A5E3A] hover:text-[#183324] px-2.5 py-1 rounded-lg bg-[#EAF3ED] hover:bg-[#D9EADB] transition-colors"
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
