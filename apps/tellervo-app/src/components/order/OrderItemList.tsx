import React from 'react';
import { Bell, Package, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OrderItemListProps {
  items: {
    name: string;
    qty: number;
    price: number;
    status?: string;
    imageUrl?: string;
    category?: string;
    size?: string;
  }[];
}

export const OrderItemList: React.FC<OrderItemListProps> = ({ items }) => {
  const { addToCart, products, showToast, toggleRestockNotification, isRestockNotified } = useApp();

  const handleReorderSingleItem = (
    item: {
      name: string;
      qty: number;
      price: number;
      status?: string;
      imageUrl?: string;
      category?: string;
      size?: string;
    },
    isOutOfStock: boolean
  ) => {
    if (isOutOfStock) {
      showToast(`${item.name} is currently out of stock`, 'info');
      return;
    }

    const matchingProduct = products.find(
      (p) => p.name.toLowerCase() === item.name.toLowerCase()
    ) || {
      id: `reorder-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: item.name,
      category: item.category || 'Cellar Drop',
      price: item.price,
      size: item.size || 'Standard Pack',
      description: `Reordered provision: ${item.name}`,
      imageUrl: item.imageUrl || '',
    };

    addToCart(matchingProduct, item.qty || 1);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-soft-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
          <Package className="w-4 h-4 text-[#988151]" />
          <span>Items in this Dispatch</span>
        </h3>
        <span className="text-xs font-bold text-[#6D7F72]">
          {items?.length || 0} {items?.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="divide-y divide-[#F2ECE1]">
        {items?.map((item, idx) => {
          const lineTotal = item.qty * item.price;
          const matchingProduct = products.find(
            (p) => p.name.toLowerCase() === item.name.toLowerCase()
          );

          const itemImageUrl = item.imageUrl || matchingProduct?.imageUrl;

          // Determine stock status from matching product or item.status
          const rawStatus = (item.status || matchingProduct?.status || '').toLowerCase().trim();
          const normalizedStatus = rawStatus.replace(/[\s_-]+/g, '');
          const isOutOfStock =
            normalizedStatus === 'outofstock' ||
            rawStatus === 'out of stock' ||
            rawStatus === 'out_of_stock' ||
            rawStatus === 'out-of-stock' ||
            matchingProduct?.stockStatus === 'out-of-stock' ||
            (matchingProduct?.stockCount !== undefined && matchingProduct.stockCount <= 0);

          const isLowStock =
            !isOutOfStock &&
            (normalizedStatus === 'lowstock' ||
              rawStatus === 'low stock' ||
              rawStatus === 'low_stock' ||
              rawStatus === 'low-stock' ||
              matchingProduct?.stockStatus === 'low-stock' ||
              (matchingProduct?.stockCount !== undefined &&
                matchingProduct.stockCount > 0 &&
                matchingProduct.stockCount <= 5));

          return (
            <div key={idx} className="py-3 flex items-center justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F6F3EB] border border-[#E8E2D5] flex items-center justify-center shrink-0 overflow-hidden text-[#183324]">
                {itemImageUrl ? (
                  <img
                    src={itemImageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#14261B] truncate">
                    {item.name}
                  </h4>
                  {isOutOfStock ? (
                    <span className="px-1.5 py-0.5 bg-[#8B2525]/10 text-[#8B2525] border border-[#8B2525]/30 text-[9px] font-bold rounded uppercase tracking-wider">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="px-1.5 py-0.5 bg-[#C97B1A]/10 text-[#C97B1A] border border-[#C97B1A]/30 text-[9px] font-bold rounded uppercase tracking-wider">
                      Limited Stock
                    </span>
                  ) : null}
                </div>
                <div className="text-[11px] text-[#718274] mt-0.5">
                  {item.qty} × €{item.price.toFixed(2)}
                  {item.size ? ` • ${item.size}` : ''}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="font-editorial text-xs font-bold text-[#14261B]">
                  €{lineTotal.toFixed(2)}
                </span>
                {isOutOfStock ? (
                  <button
                    type="button"
                    onClick={() => toggleRestockNotification(matchingProduct?.id || item.name, item.name)}
                    aria-label={`Notify when ${item.name} is in stock`}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 ${
                      isRestockNotified(matchingProduct?.id || item.name)
                        ? 'bg-[#EBF4EE] text-[#1D4E31] border border-[#C5DEC9]'
                        : 'bg-[#FAF4E8] text-[#9A6218] border border-[#ECD9B7] hover:bg-[#F4ECDA]'
                    }`}
                  >
                    <Bell className={`w-3 h-3 ${isRestockNotified(matchingProduct?.id || item.name) ? 'fill-[#245D36] text-[#245D36]' : 'text-[#C97B1A]'}`} />
                    <span>{isRestockNotified(matchingProduct?.id || item.name) ? 'Notified' : 'Notify'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleReorderSingleItem(item, isOutOfStock)}
                    className="text-[10px] font-bold text-[#2A5E3A] hover:underline cursor-pointer"
                  >
                    Buy Again
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
