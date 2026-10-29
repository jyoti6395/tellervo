import React from 'react';
import { MapPin } from 'lucide-react';

interface OrderDestinationCardProps {
  recipientName?: string;
  address?: string;
  instructions?: string;
}

export const OrderDestinationCard: React.FC<OrderDestinationCardProps> = ({
  recipientName,
  address,
  instructions,
}) => {
  const displayName = recipientName || 'Registered Patron';
  const displayAddress = address || 'Standard Delivery Address';

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-soft-sm space-y-2">
      <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#988151]" />
        <span>Delivery Destination</span>
      </h3>

      <div className="text-xs space-y-1 pt-1 text-[#2E4033]">
        <div className="font-bold text-[#14261B]">{displayName}</div>
        <div className="text-[#647668]">{displayAddress}</div>
        {instructions && (
          <div className="text-[11px] text-[#86978A] pt-1">
            Note: {instructions}
          </div>
        )}
      </div>
    </div>
  );
};
