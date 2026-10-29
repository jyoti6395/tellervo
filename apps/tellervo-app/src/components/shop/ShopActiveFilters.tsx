import React from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ShopActiveFiltersProps {
  activeCategory: string;
  categoryLabel?: string;
  onClearCategory: () => void;
  selectedTags: string[];
  onRemoveTag: (tag: string) => void;
  priceFilter?: string;
  onClearPrice?: () => void;
  onOpenFilter: () => void;
  onClearAll: () => void;
}

export const ShopActiveFilters: React.FC<ShopActiveFiltersProps> = ({
  activeCategory,
  categoryLabel,
  onClearCategory,
  selectedTags,
  onRemoveTag,
  priceFilter = 'all',
  onClearPrice,
  onOpenFilter,
  onClearAll,
}) => {
  const hasActiveFilters = selectedTags.length > 0 || activeCategory !== 'all' || (Boolean(priceFilter) && priceFilter !== 'all');
  if (!hasActiveFilters) return null;

  return (
    <div className="flex items-center justify-between gap-2 pt-0.5 pb-1 animate-in fade-in duration-150">
      {/* Left-aligned selected filters with horizontal scroll */}
      <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
        {activeCategory !== 'all' && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 py-0.5 pl-2.5 pr-1 text-[11px] text-gray-800 transition-colors hover:border-amber-300">
            <span className="font-semibold">{categoryLabel || activeCategory}</span>
            <button
              type="button"
              onClick={onClearCategory}
              aria-label="Remove category filter"
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-amber-200 hover:text-gray-900"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        )}

        {priceFilter && priceFilter !== 'all' && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 py-0.5 pl-2.5 pr-1 text-[11px] text-gray-800 transition-colors hover:border-emerald-300">
            <span className="font-semibold">
              {priceFilter === 'under-100' && 'Under €100'}
              {priceFilter === '100-500' && '€100 - €500'}
              {priceFilter === 'under-500' && 'Under €500'}
              {priceFilter === 'above-500' && 'Above €500'}
            </span>
            {onClearPrice && (
              <button
                type="button"
                onClick={onClearPrice}
                aria-label="Remove price filter"
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-emerald-200 hover:text-gray-900"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </span>
        )}

        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 py-0.5 pl-2.5 pr-1 text-[11px] text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-100"
          >
            <span className="font-semibold">{tag}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              aria-label={`Remove ${tag} filter`}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>

      {/* Right-aligned filter actions */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <button
          type="button"
          onClick={onOpenFilter}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-3 w-3" />
          All filters
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-700 transition-colors hover:border-gray-500 hover:bg-gray-50"
        >
          <RotateCcw className="h-3 w-3" />
          Clear all
        </button>
      </div>
    </div>
  );
};

