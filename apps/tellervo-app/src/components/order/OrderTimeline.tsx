import React from 'react';
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  X,
  XCircle,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface OrderTimelineProps {
  orderNumber: string;
  date: string;
  statusType: 'in-transit' | 'delivered';
  status?: string;
  courier?: string;
  dispatchOrigin?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orderNumber,
  date,
  statusType,
  status,
  courier = 'Subarctic Eco Dispatch',
  dispatchOrigin = 'Tellervo Boreal Dispatch Facility',
}) => {
  const rawStatus = (status || '').toLowerCase().trim();
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

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-soft-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#988151]" />
          <span>Delivery Timeline</span>
        </h3>

        {/* Timeline Header Tag */}
        {isCancelled ? (
          <span className="text-[11px] font-bold text-[#9B1C1C] bg-[#FDF2F2] border border-[#F8D7DA] px-2.5 py-0.5 rounded-full">
            Cancelled
          </span>
        ) : isRefunded ? (
          <span className="text-[11px] font-bold text-[#7E22CE] bg-[#FAF5FF] border border-[#E9D5FF] px-2.5 py-0.5 rounded-full">
            Refund Issued
          </span>
        ) : isProcessing ? (
          <span className="text-[11px] font-bold text-[#9A6218] bg-[#FEF7EC] border border-[#F5E4C4] px-2.5 py-0.5 rounded-full">
            Preparing Order
          </span>
        ) : isPending ? (
          <span className="text-[11px] font-bold text-[#4B5563] bg-[#F3F4F6] border border-[#E5E7EB] px-2.5 py-0.5 rounded-full">
            Pending Confirmation
          </span>
        ) : isDelivered ? (
          <span className="text-[11px] font-bold text-[#1E5230] bg-[#EAF3ED] border border-[#CFE2D4] px-2.5 py-0.5 rounded-full">
            Delivered
          </span>
        ) : (
          <span className="text-[11px] font-bold text-[#285737] bg-[#EAF3ED] border border-[#CFE2D4] px-2.5 py-0.5 rounded-full">
            Live Tracking
          </span>
        )}
      </div>

      <div className="space-y-4 relative pl-6 border-l-2 border-[#D7E3DA] ml-3 pt-1">
        {/* Milestone 1: Current Status */}
        {isCancelled ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#9B1C1C] ring-4 ring-[#FDE2E2] flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-white stroke-[2.5]" />
            </div>
            <div className="text-xs font-bold text-[#9B1C1C]">
              Order Cancelled
            </div>
            <div className="text-[11px] text-[#6C7E71]">
              Payment declined or cancelled • Not dispatched
            </div>
          </div>
        ) : isRefunded ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#7E22CE] ring-4 ring-[#F3E8FF] flex items-center justify-center">
              <RotateCcw className="w-2.5 h-2.5 text-white stroke-[2.5]" />
            </div>
            <div className="text-xs font-bold text-[#7E22CE]">
              Refund Processed
            </div>
            <div className="text-[11px] text-[#6C7E71]">
              Payment returned to original method
            </div>
          </div>
        ) : isProcessing ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#B45309] ring-4 ring-[#FEF7EC] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#E5A953] rounded-full animate-pulse" />
            </div>
            <div className="text-xs font-bold text-[#14261B]">
              The store is preparing the order
            </div>
            <div className="text-[11px] text-[#6C7E71]">
              Provisions being carefully prepared & packed
            </div>
          </div>
        ) : isPending ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#6B7280] ring-4 ring-[#F3F4F6] flex items-center justify-center">
              <Clock className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="text-xs font-bold text-[#14261B]">
              Awaiting Payment Confirmation
            </div>
            <div className="text-[11px] text-[#6C7E71]">
              Order placed, awaiting transaction clearance
            </div>
          </div>
        ) : isDelivered ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#2E7D32] ring-4 ring-[#EAF3ED] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs font-bold text-[#14261B]">
              Delivered to Destination
            </div>
            <div className="text-[11px] text-[#6C7E71]">
              Package safely handed over at destination
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#183324] ring-4 ring-[#EAF3ED] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#E5A953] rounded-full animate-pulse" />
            </div>
            <div className="text-xs font-bold text-[#14261B]">
              {status || 'Out for Delivery'}
            </div>
            <div className="text-[11px] text-[#6C7E71]">
              Dispatched with {courier}
            </div>
          </div>
        )}

        {/* Milestone 2: Packaging / Halted */}
        {isCancelled ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#D1D5DB] flex items-center justify-center">
              <XCircle className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="text-xs font-semibold text-[#6B7280]">
              Packaging Halted
            </div>
            <div className="text-[11px] text-[#9CA3AF]">
              Provisions retained in boreal cellar inventory
            </div>
          </div>
        ) : isRefunded ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#D1D5DB] flex items-center justify-center">
              <RotateCcw className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="text-xs font-semibold text-[#6B7280]">
              Provisions Restocked
            </div>
            <div className="text-[11px] text-[#9CA3AF]">
              Inventory returned to cellar storage
            </div>
          </div>
        ) : isProcessing ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#D1D5DB] flex items-center justify-center">
              <Clock className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="text-xs font-semibold text-[#14261B]">
              Order Packaged & Cold-Sealed
            </div>
            <div className="text-[11px] text-[#6C7E71]">
              {dispatchOrigin} • Cold-chain inspection queued
            </div>
          </div>
        ) : isPending ? (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#D1D5DB] flex items-center justify-center">
              <Clock className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="text-xs font-semibold text-[#6B7280]">
              Packaging Queued
            </div>
            <div className="text-[11px] text-[#9CA3AF]">
              {dispatchOrigin} • Awaiting payment clearance
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#2E7D32] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs font-semibold text-[#14261B]">
              Order Packaged & Cold-Sealed
            </div>
            <div className="text-[11px] text-[#6C7E71]">
              {dispatchOrigin} • Cold-chain inspection verified
            </div>
          </div>
        )}

        {/* Milestone 3: Order Placed / Confirmed */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#2E7D32] flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
          <div className="text-xs font-semibold text-[#14261B]">
            {isCancelled ? 'Order Registered' : 'Order Confirmed'}
          </div>
          <div className="text-[11px] text-[#6C7E71]">
            Reference {orderNumber}{date ? ` • ${date}` : ''}
          </div>
        </div>
      </div>

      {/* Bottom Status / Cold Chain Guarantee Badge */}
      {isCancelled ? (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FDF2F2]/80 border border-[#F8D7DA] text-xs text-[#9B1C1C]">
          <AlertCircle className="w-4 h-4 text-[#9B1C1C] shrink-0" />
          <span className="text-[11px] text-[#9B1C1C] leading-snug">
            This order was cancelled. No provisions were dispatched and no payment was captured.
          </span>
        </div>
      ) : isRefunded ? (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF5FF]/80 border border-[#E9D5FF] text-xs text-[#7E22CE]">
          <RotateCcw className="w-4 h-4 text-[#7E22CE] shrink-0" />
          <span className="text-[11px] text-[#7E22CE] leading-snug">
            Payment has been refunded in full to your original payment method.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#EAF3ED]/60 border border-[#D5E6DC] text-xs text-[#20492E]">
          <ShieldCheck className="w-4 h-4 text-[#285737] shrink-0" />
          <span className="text-[11px] text-[#2F523A] leading-snug">
            Protected by Tellervo Boreal Cold-Chain Guarantee: Sealed at 4°C with eco-insulated packaging.
          </span>
        </div>
      )}
    </div>
  );
};
