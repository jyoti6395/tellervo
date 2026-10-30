import React from 'react';
import { Package, Heart, MapPin, CreditCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickAccessGridProps {
  onSelectOrders: () => void;
  onOpenAddresses: () => void;
  onOpenPayments: () => void;
}

// Determine if an order is active (placed and in-between, not delivered/completed or cancelled/refunded)
const isOrderActive = (order: { status?: string; statusType?: string }): boolean => {
  const norm = (order.status || '').toLowerCase().trim();

  // Cancelled, refunded, delivered/completed are terminal states — not active
  if (
    norm === 'cancelled' ||
    norm === 'canceled' ||
    norm === 'refunded' ||
    norm === 'completed' ||
    norm === 'delivered'
  ) {
    return false;
  }

  if (order.statusType === 'delivered') {
    return false;
  }

  // Active in-between states: placed and in progress / processing / in transit / shipped / pending
  if (
    norm === 'in progress' ||
    norm === 'processing' ||
    norm === 'in_progress' ||
    norm === 'shipments' ||
    norm === 'shipped' ||
    norm === 'in transit' ||
    norm === 'in-transit' ||
    norm === 'pending'
  ) {
    return true;
  }

  return order.statusType === 'in-transit';
};

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  onSelectOrders,
  onOpenAddresses,
  onOpenPayments,
}) => {
  const { favorites, setActiveTab, user, orders } = useApp();

  const activeOrdersCount = orders.filter(isOrderActive).length;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 1. My Orders Card */}
      <button
        type="button"
        onClick={onSelectOrders}
        className="group bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm hover:border-[#183324]/30 hover:shadow-soft transition-all text-left flex flex-col justify-between active:scale-[0.98]"
      >
        <div className="flex items-start justify-between w-full mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5F2EB] group-hover:bg-[#E8F3EB] flex items-center justify-center text-[#183324] transition-colors">
            <Package className="w-5 h-5 stroke-[1.8]" />
          </div>
          {activeOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#EAF3ED] border border-[#CFE2D4] text-[#246138] text-[10px] font-bold">
              {activeOrdersCount} Active
            </span>
          )}
        </div>
        <div>
          <h4 className="font-editorial text-base font-semibold text-[#14261B] group-hover:text-[#183324] transition-colors leading-snug">
            My Orders
          </h4>
          <p className="text-[11px] text-[#718274] mt-0.5 leading-snug">
            Track, reorder, and view purchases.
          </p>
        </div>
      </button>

      {/* 2. My Favorites Card */}
      <button
        type="button"
        onClick={() => setActiveTab('favorites')}
        className="group bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm hover:border-[#183324]/30 hover:shadow-soft transition-all text-left flex flex-col justify-between active:scale-[0.98]"
      >
        <div className="flex items-start justify-between w-full mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5F2EB] group-hover:bg-[#FAF0E6] flex items-center justify-center text-[#183324] group-hover:text-[#D45B5B] transition-colors">
            <Heart className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#F5F2EB] border border-[#E8E2D5] text-[#4F6454] text-[10px] font-bold">
            {favorites.length} Saved
          </span>
        </div>
        <div>
          <h4 className="font-editorial text-base font-semibold text-[#14261B] group-hover:text-[#183324] transition-colors leading-snug">
            My Favorites
          </h4>
          <p className="text-[11px] text-[#718274] mt-0.5 leading-snug">
            Saved drinks and cellar vault.
          </p>
        </div>
      </button>

      {/* 3. My Addresses Card */}
      <button
        type="button"
        onClick={onOpenAddresses}
        className="group bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm hover:border-[#183324]/30 hover:shadow-soft transition-all text-left flex flex-col justify-between active:scale-[0.98]"
      >
        <div className="flex items-start justify-between w-full mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5F2EB] group-hover:bg-[#E8F3EB] flex items-center justify-center text-[#183324] transition-colors">
            <MapPin className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] border border-[#ECE4D5] text-[#718274] text-[9px] font-bold uppercase tracking-wider">
            Default
          </span>
        </div>
        <div>
          <h4 className="font-editorial text-base font-semibold text-[#14261B] group-hover:text-[#183324] transition-colors leading-snug">
            My Addresses
          </h4>
          <p className="text-[11px] text-[#718274] mt-0.5 leading-snug truncate">
            {user.address ? user.address.split(',')[0] : 'Home, work & lockers.'}
          </p>
        </div>
      </button>

      {/* 4. Payments Card */}
      <button
        type="button"
        onClick={onOpenPayments}
        className="group bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm hover:border-[#183324]/30 hover:shadow-soft transition-all text-left flex flex-col justify-between active:scale-[0.98]"
      >
        <div className="flex items-start justify-between w-full mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5F2EB] group-hover:bg-[#E8F3EB] flex items-center justify-center text-[#183324] transition-colors">
            <CreditCard className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] border border-[#ECE4D5] text-[#718274] text-[9px] font-bold uppercase tracking-wider">
            Secured
          </span>
        </div>
        <div>
          <h4 className="font-editorial text-base font-semibold text-[#14261B] group-hover:text-[#183324] transition-colors leading-snug">
            Payments
          </h4>
          <p className="text-[11px] text-[#718274] mt-0.5 leading-snug truncate">
            {user.paymentMethod ? user.paymentMethod : 'Apple Pay, cards & bank.'}
          </p>
        </div>
      </button>
    </div>
  );
};
