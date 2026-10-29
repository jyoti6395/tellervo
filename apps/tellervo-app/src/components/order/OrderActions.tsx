import React from 'react';
import { Bell, ShoppingBag, MessageSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderItem } from '../../types';

interface OrderActionsProps {
  order: OrderItem;
}

export const OrderActions: React.FC<OrderActionsProps> = ({ order }) => {
  const { addToCart, products, setIsCartOpen, setIsChatbotOpen, showToast, triggerConfetti, toggleRestockNotification, isRestockNotified } = useApp();

  // Status checks on the order
  const rawStatus = (order.status || '').toLowerCase().trim();
  const normalizedStatus = rawStatus.replace(/[\s_-]+/g, '');
  const isOrderOutOfStock =
    normalizedStatus === 'outofstock' ||
    rawStatus === 'out of stock' ||
    rawStatus === 'out_of_stock' ||
    rawStatus === 'out-of-stock' ||
    (order.items &&
      order.items.length > 0 &&
      order.items.every((item) => {
        const p = products.find((prod) => prod.name.toLowerCase() === item.name.toLowerCase());
        const pStatus = (p?.status || item.status || '').toLowerCase();
        return (
          pStatus === 'out of stock' ||
          pStatus === 'out_of_stock' ||
          p?.stockStatus === 'out-of-stock' ||
          (p?.stockCount !== undefined && p.stockCount <= 0)
        );
      }));

  const isOrderLowStock =
    !isOrderOutOfStock &&
    (rawStatus === 'low stock' ||
      rawStatus === 'low_stock' ||
      (order.items &&
        order.items.some((item) => {
          const p = products.find((prod) => prod.name.toLowerCase() === item.name.toLowerCase());
          const pStatus = (p?.status || item.status || '').toLowerCase();
          return (
            pStatus === 'low stock' ||
            pStatus === 'low_stock' ||
            p?.stockStatus === 'low-stock' ||
            (p?.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= 5)
          );
        })));

  const handleReorderAll = () => {
    if (isOrderOutOfStock) {
      showToast('This order contains items that are currently out of stock', 'info');
      return;
    }

    if (!order.items || order.items.length === 0) return;

    let addedCount = 0;
    order.items.forEach((item) => {
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

      const pStatus = (matchingProduct.status || item.status || '').toLowerCase();
      const itemOutOfStock =
        pStatus === 'out of stock' ||
        pStatus === 'out_of_stock' ||
        matchingProduct.stockStatus === 'out-of-stock' ||
        (matchingProduct.stockCount !== undefined && matchingProduct.stockCount <= 0);

      if (!itemOutOfStock) {
        addToCart(matchingProduct, item.qty);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      triggerConfetti();
      showToast(`Added items from ${order.orderNumber} to your Forest Box!`);
      setIsCartOpen(true);
    } else {
      showToast('Selected items are currently out of stock', 'info');
    }
  };

  return (
    <div className="space-y-2 pt-2">
      {/* Low Stock Warning Pill if applicable */}
      {isOrderLowStock && (
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#FAF4E8] border border-[#ECD9B7] rounded-xl text-[#B4670E] text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C97B1A] animate-pulse" />
          <span>Limited stock available for provisions in this order</span>
        </div>
      )}

      {/* Main Purchase / Reorder Button */}
      {isOrderOutOfStock ? (
        <button
          type="button"
          onClick={() => toggleRestockNotification(order.id, order.summary || order.orderNumber)}
          aria-label="Notify when order provisions are active again"
          className={`w-full py-3.5 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98] ${
            isRestockNotified(order.id)
              ? 'bg-[#EBF4EE] text-[#1B462C] border border-[#C5DEC9]'
              : 'bg-[#FAF4E8] text-[#9A6218] border border-[#ECD9B7] hover:bg-[#F4ECDA]'
          }`}
        >
          <Bell className={`w-4 h-4 ${isRestockNotified(order.id) ? 'fill-[#245D36] text-[#245D36]' : 'text-[#C97B1A]'}`} />
          <span>{isRestockNotified(order.id) ? 'Notification Set • We’ll Notify You When Active' : 'Notify Me When Active Again'}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleReorderAll}
          className="w-full py-3.5 bg-[#183324] text-[#FAF8F3] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#254632] active:scale-[0.98] transition-all shadow-md cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-[#E5A953]" />
          <span>Reorder Entire Vault Drop</span>
          <span>•</span>
          <span>€{order.total.toFixed(2)}</span>
        </button>
      )}

      {/* Sommelier Support CTA */}
      <button
        type="button"
        onClick={() => {
          setIsChatbotOpen(true);
          showToast('Sommelier AI ready to assist with order inquiry', 'info');
        }}
        className="w-full py-3 bg-white hover:bg-[#FAF8F3] border border-[#E2DBD0] rounded-2xl text-xs font-semibold text-[#1F3928] flex items-center justify-center gap-2 transition-colors active:scale-[0.99] shadow-soft-sm cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5 text-[#8F7440]" />
        <span>Need Help with this Order? Ask Sommelier</span>
      </button>
    </div>
  );
};
