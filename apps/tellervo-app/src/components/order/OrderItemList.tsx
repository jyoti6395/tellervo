import React, { useState } from 'react';
import { Package, ShoppingBag, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { productService } from '@tellervo/supabase';
import { mapRecordToProduct } from '../../lib/productMapper';
import { Product } from '../../types';

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
  const { addToCart, products, showToast, setIsCartOpen } = useApp();
  const [checkingItemName, setCheckingItemName] = useState<string | null>(null);

  // Helper to find live store product from in-memory products or Supabase database
  const findLiveProduct = async (item: {
    name: string;
    category?: string;
  }): Promise<Product | null> => {
    // 1. Look in loaded products memory first
    const inMem = products.find(
      (p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
    );
    if (inMem) return inMem;

    // 2. Query Supabase directly if not in current loaded memory
    try {
      const { data, error } = await productService.fetchProducts({ search: item.name.trim() });
      if (!error && data && data.length > 0) {
        const exact = data.find(
          (r) => r.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );
        if (exact) {
          return mapRecordToProduct(exact);
        }
      }
    } catch (err) {
      console.error('[OrderItemList] Error checking product availability:', err);
    }

    return null;
  };

  const isProductOutOfStock = (prod: Product): boolean => {
    const raw = (prod.status || '').toLowerCase().trim();
    const norm = raw.replace(/[\s_-]+/g, '');
    return (
      norm === 'outofstock' ||
      raw === 'out of stock' ||
      raw === 'out_of_stock' ||
      raw === 'out-of-stock' ||
      raw === 'draft' ||
      raw === 'archived' ||
      raw === 'inactive' ||
      prod.stockStatus === 'out-of-stock' ||
      (prod.stockCount !== undefined && prod.stockCount <= 0)
    );
  };

  const handleReorderSingleItem = async (
    item: {
      name: string;
      qty: number;
      price: number;
      status?: string;
      imageUrl?: string;
      category?: string;
      size?: string;
    }
  ) => {
    try {
      setCheckingItemName(item.name);
      const liveProduct = await findLiveProduct(item);

      // 1. Check if the product exists in the catalog
      if (!liveProduct) {
        showToast(`${item.name} is not available in stock`, 'info');
        return;
      }

      // 2. Check if product is out of stock
      if (isProductOutOfStock(liveProduct)) {
        showToast(`${liveProduct.name} is not available in stock`, 'info');
        return;
      }

      // 3. Price check: use current live catalog price
      const currentPrice = liveProduct.discountPrice ?? liveProduct.price;
      const oldPrice = item.price;
      const isPriceIncreased = currentPrice > oldPrice + 0.009;

      // Add to cart with current active catalog price
      const productToAdd: Product = {
        ...liveProduct,
        price: currentPrice,
      };

      addToCart(productToAdd, item.qty || 1);
      setIsCartOpen(true);

      if (isPriceIncreased) {
        showToast(
          `${liveProduct.name} price increased to €${currentPrice.toFixed(2)} (was €${oldPrice.toFixed(2)}) • Added to cart at updated price`,
          'info'
        );
      } else {
        showToast(`Added ${liveProduct.name} to Forest Box`);
      }
    } finally {
      setCheckingItemName(null);
    }
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
                <button
                  type="button"
                  onClick={() => handleReorderSingleItem(item)}
                  disabled={checkingItemName === item.name}
                  className="text-[10px] font-bold text-[#2A5E3A] hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1 active:scale-95 transition-transform"
                >
                  {checkingItemName === item.name && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Buy Again</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
