import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';

interface ShopSortHeaderProps {
  totalCount: number;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ShopSortHeader: React.FC<ShopSortHeaderProps> = ({
  totalCount,
  sortBy,
  setSortBy,
  isOpen,
  setIsOpen,
}) => {
  const { t } = useApp();

  return (
    <div className="flex items-center justify-between text-xs text-[#6C7E71] pt-1">
      <div>
        <span className="font-semibold text-[#183122]">
          {totalCount} {t.shop.blendsCount}
        </span>
        <span className="mx-1.5">•</span>
        <span>{t.shop.handcraftedIn}</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 bg-white border border-[#E5DFD2] rounded-xl text-xs font-medium text-[#203628] flex items-center gap-1 hover:bg-[#F9F7F1]"
        >
          <span>
            {sortBy === 'popular' && t.shop.popular}
            {sortBy === 'rating' && t.shop.topRated}
            {sortBy === 'price-asc' && t.shop.priceLowHigh}
            {sortBy === 'price-desc' && t.shop.priceHighLow}
          </span>
          <ChevronDown className="w-3 h-3 text-[#7B8B7E]" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-8 w-36 bg-white border border-[#E5DFD2] rounded-xl shadow-lg z-30 py-1 text-xs">
            <button
              onClick={() => {
                setSortBy('popular');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F4EB] text-[#1B3123]"
            >
              {t.shop.popular}
            </button>
            <button
              onClick={() => {
                setSortBy('rating');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F4EB] text-[#1B3123]"
            >
              {t.shop.topRated}
            </button>
            <button
              onClick={() => {
                setSortBy('price-asc');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F4EB] text-[#1B3123]"
            >
              {t.shop.priceLowHigh}
            </button>
            <button
              onClick={() => {
                setSortBy('price-desc');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F4EB] text-[#1B3123]"
            >
              {t.shop.priceHighLow}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

