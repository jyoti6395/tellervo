import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShopEmptyStateProps {
  onReset: () => void;
}

export const ShopEmptyState: React.FC<ShopEmptyStateProps> = ({ onReset }) => {
  const { t } = useApp();

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#EAE4D7] text-center space-y-3 my-4 shadow-soft-sm">
      <div className="w-12 h-12 rounded-2xl bg-[#F6F3EB] border border-[#EAE4D7] flex items-center justify-center text-2xl mx-auto shadow-2xs">
        🌿
      </div>
      <div>
        <h3 className="font-editorial text-lg font-bold text-[#14261B]">
          {t.shop.noBlendsFound}
        </h3>
        <p className="text-xs text-[#718274] max-w-xs mx-auto mt-1 leading-relaxed">
          Try adjusting your search or active filter tags to discover other cellar drops.
        </p>
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#254632] inline-flex items-center gap-1.5 transition-all shadow-xs"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{t.shop.showAllDrinks}</span>
      </button>
    </div>
  );
};
