import React from 'react';
import { Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

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
  const isDelivered = statusType === 'delivered';

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-soft-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#988151]" />
          <span>Delivery Timeline</span>
        </h3>
        <span className="text-[11px] font-bold text-[#285737] bg-[#EAF3ED] px-2 py-0.5 rounded-full">
          Live Tracking
        </span>
      </div>

      <div className="space-y-4 relative pl-6 border-l-2 border-[#D7E3DA] ml-3 pt-1">
        {/* Milestone 1: Current Status */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#183324] ring-4 ring-[#EAF3ED] flex items-center justify-center">
            {isDelivered ? (
              <CheckCircle2 className="w-3 h-3 text-white" />
            ) : (
              <div className="w-1.5 h-1.5 bg-[#E5A953] rounded-full animate-pulse" />
            )}
          </div>
          <div className="text-xs font-bold text-[#14261B]">
            {isDelivered ? 'Delivered to Destination' : (status || 'Out for Delivery')}
          </div>
          <div className="text-[11px] text-[#6C7E71]">
            {isDelivered
              ? 'Package safely handed over at destination'
              : `Dispatched with ${courier}`}
          </div>
        </div>

        {/* Milestone 2: Packaging & Inspection */}
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

        {/* Milestone 3: Order Confirmed */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#2E7D32] flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
          <div className="text-xs font-semibold text-[#14261B]">
            Order Confirmed
          </div>
          <div className="text-[11px] text-[#6C7E71]">
            Reference {orderNumber}{date ? ` • ${date}` : ''}
          </div>
        </div>
      </div>

      {/* Cold Chain Guarantee Badge */}
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#EAF3ED]/60 border border-[#D5E6DC] text-xs text-[#20492E]">
        <ShieldCheck className="w-4 h-4 text-[#285737] shrink-0" />
        <span className="text-[11px] text-[#2F523A] leading-snug">
          Protected by Tellervo Boreal Cold-Chain Guarantee: Sealed at 4°C with eco-insulated packaging.
        </span>
      </div>
    </div>
  );
};
