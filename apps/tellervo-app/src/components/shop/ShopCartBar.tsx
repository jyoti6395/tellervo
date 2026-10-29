import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShopCartBar: React.FC = () => {
  const { cartCount, cartTotal, setIsCartOpen, t } = useApp();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 w-full z-30 px-4 pointer-events-none">
      <div className="w-full pointer-events-auto">
        <div className="bg-[#183324] text-white rounded-2xl p-2.5 px-3.5 shadow-float border border-[#284B36] flex items-center justify-between animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#284B36] flex items-center justify-center text-[#E5A953]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>{t.shop.forestBox}</span>
                <span className="text-[10px] font-medium text-[#A6C4AF]">
                  ({cartCount} {t.shop.items})
                </span>
              </div>
              <div className="text-[11px] text-[#A6C4AF] leading-tight">
                €{cartTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-3.5 py-1.5 bg-[#E5A953] text-[#14261B] rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#d69842] active:scale-95 transition-all shadow-xs"
          >
            <span>{t.shop.viewBox}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

