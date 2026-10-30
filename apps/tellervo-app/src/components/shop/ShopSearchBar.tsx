import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, CornerDownLeft, Tag, Loader2, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { productService } from '@tellervo/supabase';
import { mapRecordToProduct } from '../../lib/productMapper';
import { Product } from '../../types';

export interface SearchSuggestion {
  id: string;
  type: 'category' | 'product';
  title: string;
  subtitle: string;
  category?: string;
  imageUrl?: string;
}

interface ShopSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  submittedQuery: string;
  onSearchSubmit: (term: string) => void;
  onClearSearch: () => void;
  onOpenFilter: () => void;
  activeFilterCount: number;
}

export const ShopSearchBar: React.FC<ShopSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  submittedQuery,
  onSearchSubmit,
  onClearSearch,
  onOpenFilter,
  activeFilterCount,
}) => {
  const { products, t } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [suggestionProducts, setSuggestionProducts] = useState<Product[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch up to 20 suggestions based on typed characters
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestionProducts([]);
      setIsSearchingSuggestions(false);
      return;
    }

    let isCancelled = false;
    setIsSearchingSuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await productService.fetchProducts({
          search: q,
          limit: 20,
        });

        if (isCancelled) return;

        if (!error && data) {
          setSuggestionProducts(data.map(mapRecordToProduct));
        } else {
          setSuggestionProducts([]);
        }
      } catch {
        if (!isCancelled) setSuggestionProducts([]);
      } finally {
        if (!isCancelled) setIsSearchingSuggestions(false);
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Compute suggestions (categories first, then product names, then notes/badges, capped to 20)
  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const result: SearchSuggestion[] = [];
    const seenKeys = new Set<string>();
    const allCandidates = [...products, ...suggestionProducts];

    // 1. Matching categories
    const categoriesSet = new Set<string>();
    for (const p of allCandidates) {
      if (p.category && p.category.trim()) {
        categoriesSet.add(p.category.trim());
      }
    }

    for (const cat of categoriesSet) {
      if (cat.toLowerCase().includes(q)) {
        const key = `cat-${cat.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          result.push({
            id: key,
            type: 'category',
            title: cat,
            subtitle: 'Category',
          });
          if (result.length >= 20) return result;
        }
      }
    }

    // 2. Matching drink names
    for (const p of allCandidates) {
      if (p.name && p.name.toLowerCase().includes(q)) {
        const key = `prod-${p.name.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          result.push({
            id: `prod-${p.id}`,
            type: 'product',
            title: p.name,
            subtitle: p.category || 'Drink',
            category: p.category,
            imageUrl: p.imageUrl,
          });
          if (result.length >= 20) return result;
        }
      }
    }

    // 3. Matching notes or badges
    for (const p of allCandidates) {
      if (
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      ) {
        const key = `prod-${p.name.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          result.push({
            id: `note-${p.id}`,
            type: 'product',
            title: p.name,
            subtitle: p.notes || p.badge || p.category,
            category: p.category,
            imageUrl: p.imageUrl,
          });
          if (result.length >= 20) return result;
        }
      }
    }

    return result.slice(0, 20);
  }, [searchQuery, products, suggestionProducts]);

  const handleSubmit = (term: string) => {
    const q = term.trim();
    if (!q) return;
    onSearchSubmit(q);
    setIsDropdownOpen(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleClear = () => {
    onClearSearch();
    setIsDropdownOpen(false);
    setSelectedSuggestionIndex(-1);
  };

  return (
    <div ref={containerRef} className="flex items-center gap-2 relative z-30">
      <div className="relative flex-1">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t.home?.searchPlaceholder || t.shop?.searchPlaceholder || 'Search pine, cloudberry, birch infu...'}
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim()) {
                setIsDropdownOpen(true);
              }
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedSuggestionIndex(-1);
              setIsDropdownOpen(true);
              if (submittedQuery && !e.target.value.trim()) {
                handleClear();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!isDropdownOpen) {
                  setIsDropdownOpen(true);
                  return;
                }
                if (suggestions.length > 0) {
                  setSelectedSuggestionIndex((prev) => {
                    const next = prev < suggestions.length - 1 ? prev + 1 : 0;
                    document.getElementById(`shop-suggestion-item-${next}`)?.scrollIntoView({ block: 'nearest' });
                    return next;
                  });
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (suggestions.length > 0) {
                  setSelectedSuggestionIndex((prev) => {
                    const next = prev > 0 ? prev - 1 : suggestions.length - 1;
                    document.getElementById(`shop-suggestion-item-${next}`)?.scrollIntoView({ block: 'nearest' });
                    return next;
                  });
                }
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (isDropdownOpen && selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                  handleSubmit(suggestions[selectedSuggestionIndex].title);
                } else {
                  handleSubmit(searchQuery);
                }
              } else if (e.key === 'Escape') {
                setIsDropdownOpen(false);
                setSelectedSuggestionIndex(-1);
              }
            }}
            className="w-full pl-10 pr-28 py-2.5 bg-white border border-[#E5DFD0] rounded-2xl text-xs text-[#1C3122] placeholder-[#8C9C8F] shadow-soft-sm focus:outline-none focus:ring-1 focus:ring-[#183324]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="text-[#8C9C8F] hover:text-[#1C3122] p-1 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isDropdownOpen && selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                  handleSubmit(suggestions[selectedSuggestionIndex].title);
                } else {
                  handleSubmit(searchQuery);
                }
              }}
              className="px-2.5 py-1 bg-[#183324] text-white text-[10px] font-bold rounded-xl hover:bg-[#284B36] active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              title="Press Enter to search"
            >
              <span>Search</span>
              <CornerDownLeft className="w-2.5 h-2.5 text-[#E5A953]" />
            </button>
          </div>
        </div>

        {/* Suggestion Dropdown: Up to 20 suggestions */}
        {isDropdownOpen && searchQuery.trim() && !submittedQuery && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-[#E5DFD0] shadow-xl overflow-hidden z-40 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            {isSearchingSuggestions && suggestions.length === 0 ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#7A8C7E]">
                <Loader2 className="w-4 h-4 animate-spin text-[#2E5E3B]" />
                <span>Finding matching names & categories...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#7A8C7E]">
                No suggestions found for "{searchQuery}".
              </div>
            ) : (
              <div className="divide-y divide-[#F3EFE6]">
                {suggestions.map((item, index) => {
                  const isSelected = index === selectedSuggestionIndex;
                  return (
                    <button
                      key={item.id}
                      id={`shop-suggestion-item-${index}`}
                      type="button"
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      onClick={() => handleSubmit(item.title)}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors group cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2ECE0] border-l-4 border-[#183324]'
                          : 'hover:bg-[#F9F7F1]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover border border-[#E8DFCF] shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-[#F5EFE3] flex items-center justify-center text-[#9A7D46] shrink-0">
                            {item.type === 'category' ? (
                              <Tag className="w-3.5 h-3.5" />
                            ) : (
                              <Search className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}
                        <div className="truncate">
                          <div
                            className={`text-xs font-medium truncate transition-colors ${
                              isSelected
                                ? 'text-[#183324] font-semibold'
                                : 'text-[#14261B] group-hover:text-[#255234]'
                            }`}
                          >
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-[10px] text-[#869888] truncate">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          item.type === 'category'
                            ? 'bg-[#EBF3ED] text-[#245D36] border border-[#C5DEC9]'
                            : 'bg-[#F6F2E8] text-[#8C6D2B] border border-[#ECDDBF]'
                        }`}
                      >
                        {item.type === 'category' ? 'Category' : 'Drink'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters Button with count badge */}
      <button
        type="button"
        onClick={onOpenFilter}
        className="px-3.5 py-2.5 rounded-2xl bg-[#183324] text-[#FAF8F3] text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#234330] active:scale-95 transition-all shrink-0 cursor-pointer"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>{t.shop?.filters || 'Filters'}</span>
        {activeFilterCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-[#E5A953] text-[#12281C] text-[10px] font-bold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
};
