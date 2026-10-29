import React, { useMemo, useState, useEffect } from 'react';
import { productService } from '@tellervo/supabase';
import { createPortal } from 'react-dom';
import { X, Check, RotateCcw } from 'lucide-react';
import { Product } from '../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
  priceFilter?: string;
  setPriceFilter?: (price: string) => void;
  products?: Product[];
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  selectedTags,
  setSelectedTags,
  activeCategory = 'all',
  setActiveCategory,
  priceFilter = 'all',
  setPriceFilter,
  products = [],
}) => {
  if (!isOpen) return null;

  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [dbVessels, setDbVessels] = useState<string[]>([]);

  // Fetch all distinct categories and packaging vessels from the database
  useEffect(() => {
    let isMounted = true;
    productService.fetchDistinctFilterOptions().then(({ categories, volumes }: { categories: string[]; volumes: string[] }) => {
      if (isMounted) {
        if (categories && categories.length > 0) setDbCategories(categories);
        if (volumes && volumes.length > 0) setDbVessels(volumes);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 1. Drink categories: merges all categories from database with any currently loaded in products
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    dbCategories.forEach(c => set.add(c.trim()));
    products.forEach(p => {
      if (p.category) set.add(p.category.trim());
    });
    const uniqueCats = Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
    return [
      { id: 'all', label: 'All Drinks' },
      ...uniqueCats.map(cat => ({ id: cat, label: cat })),
    ];
  }, [dbCategories, products]);

  // 2. Packaging & vessels: merges all volumes from database with any currently loaded in products
  const dynamicVessels = useMemo(() => {
    const set = new Set<string>();
    dbVessels.forEach(v => set.add(v.trim()));
    products.forEach(p => {
      if (p.size) set.add(p.size.trim());
    });
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [dbVessels, products]);

  const toggleOption = (opt: string) => {
    setSelectedTags(prev =>
      prev.includes(opt) ? prev.filter(t => t !== opt) : [...prev, opt]
    );
  };

  const clearAll = () => {
    setSelectedTags([]);
    if (setActiveCategory) {
      setActiveCategory('all');
    }
    if (setPriceFilter) {
      setPriceFilter('all');
    }
  };

  const activeCount =
    (activeCategory !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    selectedTags.length;

  const drawerContent = (
    <div className="fixed inset-0 top-0 bottom-0 left-0 right-0 z-50 flex justify-end">
      <div onClick={onClose} className="fixed inset-0 bg-[#0E1D14]/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-[#FBF9F5] h-full h-screen h-[100dvh] min-h-screen flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#EAE4D7] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-editorial text-xl font-medium text-[#14261B]">Infusion Filters</h3>
            <p className="text-[11px] text-[#78887C]">{activeCount} active criteria</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F0E6] flex items-center justify-center text-[#3D5244] hover:bg-[#EAE5D9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Drink Category Selection (from product table category field) */}
          {setActiveCategory && (
            <div>
              <h4 className="text-xs font-bold text-[#14261B] uppercase tracking-wider mb-2.5">
                Drink Category
              </h4>
              <div className="flex flex-wrap gap-2">
                {dynamicCategories.map(cat => {
                  const isActive = (activeCategory || 'all').toLowerCase() === cat.id.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#183324] text-white border-[#183324] shadow-sm'
                          : 'bg-white text-[#293F31] border-[#E2DBD0] hover:border-[#C4B7A4]'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 text-[#E5A953]" />}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Price Range Filter */}
          {setPriceFilter && (
            <div>
              <h4 className="text-xs font-bold text-[#14261B] uppercase tracking-wider mb-2.5">
                Price Range
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under-100', label: 'Under €100' },
                  { id: '100-500', label: '€100 - €500' },
                  { id: 'under-500', label: 'Under €500' },
                  { id: 'above-500', label: 'Above €500' },
                ].map((option) => {
                  const isActive = (priceFilter || 'all') === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setPriceFilter(option.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#183324] text-white border-[#183324] shadow-sm'
                          : 'bg-white text-[#293F31] border-[#E2DBD0] hover:border-[#C4B7A4]'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 text-[#E5A953]" />}
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Packaging & Vessel Selection (from product table volume field) */}
          <div>
            <h4 className="text-xs font-bold text-[#14261B] uppercase tracking-wider mb-2.5">
              Packaging & Vessel
            </h4>
            {dynamicVessels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dynamicVessels.map(vessel => {
                  const active = selectedTags.includes(vessel);
                  return (
                    <button
                      key={vessel}
                      onClick={() => toggleOption(vessel)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-[#183324] text-white border-[#183324] shadow-sm'
                          : 'bg-white text-[#293F31] border-[#E2DBD0] hover:border-[#C4B7A4]'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-[#E5A953]" />}
                      <span>{vessel}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#78887C]">No vessels found in products</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EAE4D7] flex items-center gap-3 shrink-0">
          <button
            onClick={clearAll}
            className="flex-1 py-3 border border-[#DCD5C6] text-[#4F6456] text-xs font-semibold rounded-xl hover:bg-[#F6F3EC] flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#234330]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(drawerContent, document.body)
    : drawerContent;
};
