import React, { useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  selectedTags,
  setSelectedTags,
  activeCategory = 'all',
  setActiveCategory,
}) => {
  if (!isOpen) return null;

  const drinkCategories = [
    { id: 'all', label: '🍸 All Drinks' },
    { id: 'juices', label: '🧃 Juices' },
    { id: 'smoothies', label: '🥤 Smoothies' },
    { id: 'detox', label: '🌿 Detox Drinks' },
    { id: 'tonics', label: '💧 Tonics & Mixers' },
    { id: 'sparkling', label: '✨ Wild Sparkling' },
    { id: 'spirits', label: '🍂 Zero-Proof Spirits' },
  ];

  const filterCategories = [
    {
      title: 'Dietary & Purity',
      options: ['Organic', 'Zero Sugar', 'Adaptogenic', 'Zero-Proof 0.0%', 'Wild Foraged'],
    },
    {
      title: 'Packaging & Vessel',
      options: ['330ml Can', '250ml Glass', '500ml Bottle', '6-Pack Flight'],
    },
    {
      title: 'Harvest Region',
      options: ['Lapland Boreal Forest', 'Oulu Coastal Taiga', 'Kainuu Wilderness'],
    },
  ];

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
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="fixed inset-0 bg-[#0E1D14]/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-[#FBF9F5] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#EAE4D7] flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-xl font-medium text-[#14261B]">Infusion Filters</h3>
            <p className="text-[11px] text-[#78887C]">{selectedTags.length} active criteria</p>
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
          {/* Drink Category Selection */}
          {setActiveCategory && (
            <div>
              <h4 className="text-xs font-bold text-[#14261B] uppercase tracking-wider mb-2.5">
                Drink Category
              </h4>
              <div className="flex flex-wrap gap-2">
                {drinkCategories.map(cat => {
                  const isActive = activeCategory === cat.id;
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

          {filterCategories.map(cat => (
            <div key={cat.title}>
              <h4 className="text-xs font-bold text-[#14261B] uppercase tracking-wider mb-2.5">
                {cat.title}
              </h4>
              <div className="flex flex-wrap gap-2">
                {cat.options.map(opt => {
                  const active = selectedTags.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleOption(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-[#183324] text-white border-[#183324] shadow-sm'
                          : 'bg-white text-[#293F31] border-[#E2DBD0] hover:border-[#C4B7A4]'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-[#E5A953]" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EAE4D7] flex items-center gap-3">
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
};
