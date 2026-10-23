import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { 
  Search, 
  Mic, 
  SlidersHorizontal, 
  Heart, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { FilterDrawer } from '../components/FilterDrawer';

export const ShopScreen: React.FC = () => {
  const { 
    products, 
    addToCart, 
    favorites, 
    toggleFavorite, 
    cart, 
    cartCount, 
    cartTotal, 
    setIsCartOpen,
    setSelectedProduct,
    showToast,
    t
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const categories = [
    { id: 'all', label: t.shop.allDrinks },
    { id: 'juices', label: t.shop.juices },
    { id: 'smoothies', label: t.shop.smoothies },
    { id: 'detox', label: t.shop.detoxDrinks },
    { id: 'tonics', label: t.shop.tonicsMixers },
    { id: 'sparkling', label: t.shop.wildSparkling },
    { id: 'spirits', label: t.shop.zeroProofSpirits },
  ];

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    return {
      all: products.length,
      juices: products.filter(p => p.category.includes('JUICE') || p.name.toLowerCase().includes('juice')).length,
      smoothies: products.filter(p => p.category.includes('SMOOTHIE') || p.name.toLowerCase().includes('smoothie')).length,
      detox: products.filter(p => p.category.includes('DETOX') || p.category.includes('ELIXIR') || p.name.toLowerCase().includes('detox') || p.name.toLowerCase().includes('cleanse') || p.name.toLowerCase().includes('flush')).length,
      tonics: products.filter(p => p.category.includes('TONIC') || p.name.toLowerCase().includes('tonic')).length,
      sparkling: products.filter(p => p.category.includes('SPARKLING') || p.category.includes('SPRITZ') || p.category.includes('Soda') || p.name.toLowerCase().includes('sparkler') || p.name.toLowerCase().includes('soda') || p.name.toLowerCase().includes('spritz')).length,
      spirits: products.filter(p => p.category.includes('SPIRIT') || p.category.includes('APERITIF')).length,
    };
  }, [products]);

  const handleVoiceSearch = () => {
    setIsListening(true);
    showToast('Listening for botanical infusions...', 'info');
    setTimeout(() => {
      setIsListening(false);
      setSearchQuery('Cloudberry');
      showToast('Found "Cloudberry" infusions', 'success');
    }, 1500);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = product.name.toLowerCase().includes(q) || 
                    product.category.toLowerCase().includes(q) ||
                    (product.notes && product.notes.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category Filter Bar logic
    if (activeCategory === 'juices') {
      return product.category.includes('JUICE') || product.name.toLowerCase().includes('juice');
    }
    if (activeCategory === 'smoothies') {
      return product.category.includes('SMOOTHIE') || product.name.toLowerCase().includes('smoothie');
    }
    if (activeCategory === 'detox') {
      return product.category.includes('DETOX') || product.category.includes('ELIXIR') || product.name.toLowerCase().includes('detox') || product.name.toLowerCase().includes('cleanse') || product.name.toLowerCase().includes('flush') || product.badge?.toLowerCase().includes('detox') || product.badge?.toLowerCase().includes('purifying') || product.badge?.toLowerCase().includes('liver');
    }
    if (activeCategory === 'tonics') {
      return product.category.includes('TONIC') || product.name.includes('Tonic');
    }
    if (activeCategory === 'sparkling') {
      return product.category.includes('SPARKLING') || product.category.includes('Soda') || product.category.includes('SPRITZ') || product.name.includes('Sparkler');
    }
    if (activeCategory === 'spirits') {
      return product.category.includes('SPIRIT') || product.category.includes('APERITIF');
    }

    // Filter Drawer selected tags logic
    if (selectedTags.length > 0) {
      const matchTags = selectedTags.every(tag => {
        const tLower = tag.toLowerCase();
        if (tLower === 'organic') return product.badge?.toLowerCase().includes('organic') || product.description?.toLowerCase().includes('organic');
        if (tLower === 'zero sugar') return product.description?.toLowerCase().includes('zero refined') || product.notes?.toLowerCase().includes('zero sugar') || product.description?.toLowerCase().includes('zero sugar');
        if (tLower === 'adaptogenic') return product.badgeType === 'adaptogenic' || product.category.toLowerCase().includes('adaptogen');
        if (tLower.includes('zero-proof') || tLower.includes('0.0%')) return product.badgeType === 'zero-proof' || product.category.toLowerCase().includes('zero-proof') || product.badge?.includes('0.0%');
        if (tLower === 'wild foraged') return product.badge?.toLowerCase().includes('wild') || product.description?.toLowerCase().includes('wild') || product.name.toLowerCase().includes('wild');
        if (tLower.includes('can')) return product.size?.toLowerCase().includes('can');
        if (tLower.includes('glass')) return product.size?.toLowerCase().includes('glass');
        if (tLower.includes('bottle')) return product.size?.toLowerCase().includes('bottle');
        if (tLower.includes('flight') || tLower.includes('pack')) return product.size?.toLowerCase().includes('flight') || product.size?.toLowerCase().includes('pack');
        if (tLower.includes('lapland')) return product.description?.toLowerCase().includes('lapland') || product.notes?.toLowerCase().includes('lapland') || product.harvestLocation?.toLowerCase().includes('lapland');
        if (tLower.includes('oulu')) return product.description?.toLowerCase().includes('oulu') || product.harvestLocation?.toLowerCase().includes('oulu');
        if (tLower.includes('kainuu')) return product.description?.toLowerCase().includes('kainuu') || product.harvestLocation?.toLowerCase().includes('kainuu');
        return true;
      });
      if (!matchTags) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // default popular
  });

  return (
    <div className="pb-32 px-4 pt-3 max-w-md mx-auto space-y-4 animate-in fade-in duration-200 relative">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.shop.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#E5DFD0] rounded-2xl text-xs text-[#1C3122] placeholder-[#8C9C8F] shadow-soft-sm focus:outline-none focus:ring-1 focus:ring-[#183324]"
          />
          <button
            onClick={handleVoiceSearch}
            aria-label="Voice search"
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9C8F] hover:text-[#183324] transition-colors ${
              isListening ? 'text-[#D49B4E] animate-pulse' : ''
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Button with yellow count badge */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="px-3.5 py-2.5 rounded-2xl bg-[#183324] text-[#FAF8F3] text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#234330] active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{t.shop.filters}</span>
          {selectedTags.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#E5A953] text-[#12281C] text-[10px] font-bold flex items-center justify-center">
              {selectedTags.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold text-[#7E8F82] uppercase tracking-wider">Filters:</span>
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAE5D9] text-[#183324] text-[11px] font-medium border border-[#DCD5C6]"
            >
              <span>{tag}</span>
              <button
                onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                aria-label={`Remove ${tag}`}
                className="hover:text-red-700 font-bold ml-0.5 text-xs leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => setSelectedTags([])}
            className="text-[10px] text-[#8C7443] font-semibold underline hover:text-[#5F4E2B] ml-1"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Category Filter Bar */}
      <div className="relative -mx-4 px-4 py-0.5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id as keyof typeof categoryCounts] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-[#183324] text-[#FAF8F3] shadow-md shadow-[#183324]/20 ring-1 ring-[#183324]'
                    : 'bg-white border border-[#E5DFD2] text-[#4F6355] hover:bg-[#F7F4EB] hover:text-[#183324] shadow-soft-sm'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                    isActive
                      ? 'bg-[#E5A953] text-[#14261B] font-bold'
                      : 'bg-[#F2ECE1] text-[#78887C] group-hover:bg-[#EAE4D7]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Micro-Banner for Context */}
      {activeCategory !== 'all' && (
        <div className="bg-[#FAF7EF] rounded-2xl p-3 border border-[#E9E1CE] flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-[#183324] text-[#E5A953] flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[#183122] flex items-center gap-1.5 truncate">
                <span>{categories.find(c => c.id === activeCategory)?.label}</span>
                <span className="text-[10px] font-semibold text-[#869689] uppercase">• {sortedProducts.length} Blends</span>
              </div>
              <p className="text-[11px] text-[#637568] truncate">
                {t.shop.categoryDescriptions?.[activeCategory as keyof typeof t.shop.categoryDescriptions] || ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveCategory('all')}
            className="text-[10px] font-bold text-[#8C7443] hover:underline uppercase shrink-0 px-2 py-1 rounded-lg bg-white border border-[#E8DFC8] active:scale-95 transition-all shadow-2xs"
          >
            Clear
          </button>
        </div>
      )}

      {/* Product count and Sort Dropdown */}
      <div className="flex items-center justify-between text-xs text-[#6C7E71] pt-1">
        <div>
          <span className="font-semibold text-[#183122]">{sortedProducts.length} {t.shop.blendsCount}</span>
          <span className="mx-1.5">•</span>
          <span>{t.shop.handcraftedIn}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
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

          {isSortDropdownOpen && (
            <div className="absolute right-0 top-8 w-36 bg-white border border-[#E5DFD2] rounded-xl shadow-lg z-30 py-1 text-xs">
              <button
                onClick={() => { setSortBy('popular'); setIsSortDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F7F4EB] text-[#1B3123]"
              >
                {t.shop.popular}
              </button>
              <button
                onClick={() => { setSortBy('rating'); setIsSortDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F7F4EB] text-[#1B3123]"
              >
                {t.shop.topRated}
              </button>
              <button
                onClick={() => { setSortBy('price-asc'); setIsSortDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F7F4EB] text-[#1B3123]"
              >
                {t.shop.priceLowHigh}
              </button>
              <button
                onClick={() => { setSortBy('price-desc'); setIsSortDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F7F4EB] text-[#1B3123]"
              >
                {t.shop.priceHighLow}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty State when no products match filters */}
      {sortedProducts.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-[#EAE4D7] text-center space-y-3 my-4 shadow-soft-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F6F3EB] flex items-center justify-center text-2xl mx-auto">
            🍃
          </div>
          <h3 className="font-editorial text-lg font-semibold text-[#183122]">
            No botanical blends found
          </h3>
          <p className="text-xs text-[#718274] max-w-xs mx-auto">
            No drinks matching this category or search filter. Try clearing filters or exploring other categories.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#183324] text-white rounded-xl text-xs font-semibold hover:bg-[#234330] active:scale-95 transition-all shadow-xs"
          >
            Show All Drinks
          </button>
        </div>
      )}

      {/* 2-Column Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {sortedProducts.map(product => {
          const isFav = favorites.includes(product.id);
          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl p-3 border border-[#EAE4D7] shadow-soft-sm flex flex-col justify-between group hover:border-[#D6CEBF] transition-all"
            >
              {/* Image & Badges */}
              <div 
                onClick={() => setSelectedProduct(product)}
                className="relative rounded-2xl overflow-hidden aspect-square mb-2.5 bg-[#F6F3EB] cursor-pointer"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge top-left */}
                {product.badge && (
                  <span
                    className={`absolute top-2 left-2 text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${
                      product.badgeType === 'bestseller'
                        ? 'bg-[#183324] text-white'
                        : product.badgeType === 'organic'
                        ? 'bg-[#E5A953] text-[#12281C]'
                        : product.badgeType === 'adaptogenic'
                        ? 'bg-[#D2E7DA] text-[#183624]'
                        : product.badgeType === 'new-harvest'
                        ? 'bg-[#D2E8DA] text-[#183624]'
                        : product.badgeType === 'zero-proof'
                        ? 'bg-[#162B1D] text-white'
                        : product.badgeType === 'exclusive'
                        ? 'bg-[#E5A953] text-[#12281C]'
                        : 'bg-white/90 text-[#183324]'
                    }`}
                  >
                    {product.badge}
                  </span>
                )}

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  aria-label="Save to favorites"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#21382A] hover:bg-white shadow-sm transition-transform active:scale-90"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFav ? 'fill-[#C53D43] text-[#C53D43]' : 'text-[#21382A]'
                    }`}
                  />
                </button>
              </div>

              {/* Subtitle / Category Notes */}
              <div 
                onClick={() => setSelectedProduct(product)}
                className="flex-1 cursor-pointer"
              >
                <div className="text-[9px] font-bold tracking-wider text-[#988151] uppercase mb-0.5 truncate">
                  {product.notes || product.category}
                </div>

                <h3 className="font-editorial text-sm font-semibold text-[#14261B] leading-tight line-clamp-2 hover:text-[#285737] transition-colors">
                  {product.name}
                </h3>

                <p className="text-[11px] text-[#7C8D80] mt-0.5">{product.size}</p>
              </div>

              {/* Price & Add Button */}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#F0EBE0]">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-editorial text-sm font-bold text-[#14261B]">
                    €{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-[#9EAFA2] line-through">
                      €{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => addToCart(product)}
                  aria-label={`Add ${product.name} to cart`}
                  className="w-8 h-8 rounded-full bg-[#183324] text-[#FAF8F3] flex items-center justify-center hover:bg-[#284B36] active:scale-95 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Forest Box Bar (Fixed right above bottom nav) */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-[#183324] text-white rounded-2xl p-2.5 px-3.5 shadow-float border border-[#284B36] flex items-center justify-between animate-in slide-in-from-bottom-3 duration-200">
            {/* Left bag & count */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#E5A953]">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5A953] text-[#12281C] text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">{t.cart.title}</div>
                <div className="text-[11px] text-[#A6C4B0]">
                  {cartCount} ITEMS • €{cartTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Right button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3.5 py-1.5 bg-[#E5A953] text-[#12281C] rounded-full text-xs font-bold flex items-center gap-1 hover:bg-[#F3BA68] active:scale-95 transition-all shadow-sm"
            >
              <span>{t.shop.viewBox}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
    </div>
  );
};
