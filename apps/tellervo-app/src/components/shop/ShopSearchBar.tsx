import React from 'react';
import { Search, Mic, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShopSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isListening: boolean;
  onVoiceSearch: () => void;
  onOpenFilter: () => void;
  activeFilterCount: number;
}

export const ShopSearchBar: React.FC<ShopSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isListening,
  onVoiceSearch,
  onOpenFilter,
  activeFilterCount,
}) => {
  const { t } = useApp();

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t.shop.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#E5DFD0] rounded-2xl text-xs text-[#1C3122] placeholder-[#8C9C8F] shadow-soft-sm focus:outline-none focus:ring-1 focus:ring-[#183324]"
        />
        <button
          onClick={onVoiceSearch}
          aria-label="Voice search"
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9C8F] hover:text-[#183324] transition-colors ${
            isListening ? 'text-[#D49B4E] animate-pulse' : ''
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Button with count badge */}
      <button
        onClick={onOpenFilter}
        className="px-3.5 py-2.5 rounded-2xl bg-[#183324] text-[#FAF8F3] text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#234330] active:scale-95 transition-all"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>{t.shop.filters}</span>
        {activeFilterCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-[#E5A953] text-[#12281C] text-[10px] font-bold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
};

