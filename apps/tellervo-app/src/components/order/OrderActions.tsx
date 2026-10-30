import React, { useState } from 'react';
import { ShoppingBag, MessageSquare, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderItem, Product } from '../../types';
import { productService } from '@tellervo/supabase';
import { mapRecordToProduct } from '../../lib/productMapper';

interface OrderActionsProps {
  order: OrderItem;
}

export const OrderActions: React.FC<OrderActionsProps> = ({ order }) => {
  const { addToCart, products, setIsCartOpen, setIsChatbotOpen, showToast, triggerConfetti } = useApp();
  const [isReorderingAll, setIsReorderingAll] = useState(false);

  const handleReorderAll = async () => {
    

    if (!order.items || order.items.length === 0) return;

    try {
      setIsReorderingAll(true);
      let addedCount = 0;
      let unavailableCount = 0;
      let priceIncreasedCount = 0;

      for (const item of order.items) {
        let liveProduct = products.find(
          (p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );

        if (!liveProduct) {
          try {
            const { data } = await productService.fetchProducts({ search: item.name.trim() });
            if (data && data.length > 0) {
              const exact = data.find(
                (r) => r.name.trim().toLowerCase() === item.name.trim().toLowerCase()
              );
              if (exact) {
                liveProduct = mapRecordToProduct(exact);
              }
            }
          } catch {
            // ignore
          }
        }

        // If product does not exist in catalog
        if (!liveProduct) {
          unavailableCount++;
          continue;
        }

        // Check if out of stock
        const raw = (liveProduct.status || '').toLowerCase().trim();
        const norm = raw.replace(/[\s_-]+/g, '');
        const outOfStock =
          norm === 'outofstock' ||
          raw === 'out of stock' ||
          raw === 'out_of_stock' ||
          raw === 'draft' ||
          raw === 'archived' ||
          raw === 'inactive' ||
          liveProduct.stockStatus === 'out-of-stock' ||
          (liveProduct.stockCount !== undefined && liveProduct.stockCount <= 0);

        if (outOfStock) {
          unavailableCount++;
          continue;
        }

        const currentPrice = liveProduct.discountPrice ?? liveProduct.price;
        const oldPrice = item.price;
        if (currentPrice > oldPrice + 0.009) {
          priceIncreasedCount++;
        }

        addToCart({ ...liveProduct, price: currentPrice }, item.qty || 1);
        addedCount++;
      }

      if (addedCount > 0) {
        triggerConfetti();
        setIsCartOpen(true);
        if (unavailableCount > 0 && priceIncreasedCount > 0) {
          showToast(
            `Added ${addedCount} available item(s) with updated pricing (${unavailableCount} unavailable skipped)`,
            'info'
          );
        } else if (unavailableCount > 0) {
          showToast(
            `Added ${addedCount} available item(s) (${unavailableCount} out-of-stock item(s) skipped)`,
            'info'
          );
        } else if (priceIncreasedCount > 0) {
          showToast(`Added items with updated catalog pricing to Forest Box`, 'info');
        } else {
          showToast(`Added items from ${order.orderNumber} to your Forest Box!`);
        }
      } else {
        showToast('Items from this order are not available in stock', 'info');
      }
    } finally {
      setIsReorderingAll(false);
    }
  };

  return (
    <div className="space-y-2 pt-2">
      {/* Main Purchase / Reorder Button */}
      <button
        type="button"
        onClick={handleReorderAll}
        disabled={isReorderingAll}
        className="w-full py-3.5 bg-[#183324] text-[#FAF8F3] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#254632] active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-60"
      >
        {isReorderingAll ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#E5A953]" />
        ) : (
          <ShoppingBag className="w-4 h-4 text-[#E5A953]" />
        )}
        <span>Reorder Entire Vault Drop</span>
        <span>•</span>
        <span>€{order.total.toFixed(2)}</span>
      </button>

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
