import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../routes/hooks/useNavigation';
import { HERO_FEATURED } from '../data/mockData';
import { productService } from '@tellervo/supabase';
import { mapRecordToProduct } from '../lib/productMapper';
import { Product, OrderItem } from '../types';
import { ProductCard } from '../components/shop/ProductCard';
import {
  Search,
  X,
  Loader2,
  Tag,
  CornerDownLeft,
  ArrowRight,
  ArrowUpRight,
  RotateCcw,
  Heart,
  Plus,
  Star,
  Compass,
  Sparkles,
  Flame,
} from 'lucide-react';

interface SearchSuggestion {
  id: string;
  type: 'category' | 'product';
  title: string;
  subtitle?: string;
  category?: string;
  imageUrl?: string;
}

export const HomeScreen: React.FC = () => {
  const {
    products,
    addToCart,
    favorites,
    toggleFavorite,
    setActiveTab,
    setIsQuizOpen,
    setSelectedProduct,
    showToast,
    orders,
    setIsCartOpen,
    t
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'adaptogenic' | 'spritz'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const { navigate } = useNavigation();
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

  // Helper to find live product in memory or from database
  const findLiveProduct = async (item: { name: string }): Promise<Product | null> => {
    const inMem = products.find(
      (p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
    );
    if (inMem) return inMem;

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
      console.error('[HomeScreen] Error checking product availability:', err);
    }
    return null;
  };

  const handleOneTapReorder = async (order: OrderItem) => {
    if (!order.items || order.items.length === 0) {
      showToast('No items found in this order to reorder', 'info');
      return;
    }

    try {
      setReorderingOrderId(order.id);
      let addedCount = 0;
      let unavailableCount = 0;
      let priceIncreasedCount = 0;

      for (const item of order.items) {
        const liveProduct = await findLiveProduct(item);

        // 1. Check if product exists in store catalog
        if (!liveProduct) {
          unavailableCount++;
          continue;
        }

        // 2. Check stock
        if (isProductOutOfStock(liveProduct)) {
          unavailableCount++;
          continue;
        }

        // 3. Price check
        const currentPrice = liveProduct.discountPrice ?? liveProduct.price;
        const oldPrice = item.price;
        if (currentPrice > oldPrice + 0.009) {
          priceIncreasedCount++;
        }

        addToCart({ ...liveProduct, price: currentPrice }, item.qty || 1);
        addedCount++;
      }

      if (addedCount > 0) {
        setIsCartOpen(true);
        if (order.items.length === 1) {
          const singleItem = order.items[0];
          if (priceIncreasedCount > 0) {
            showToast(
              'Price updated to current catalog pricing • Added to cart',
              'info'
            );
          } else {
            showToast(`Added ${singleItem.name} to Forest Box`);
          }
        } else {
          if (unavailableCount > 0 && priceIncreasedCount > 0) {
            showToast(
              `Added ${addedCount} item(s) at updated pricing (${unavailableCount} unavailable skipped)`,
              'info'
            );
          } else if (unavailableCount > 0) {
            showToast(
              `Added ${addedCount} available item(s) (${unavailableCount} out-of-stock skipped)`,
              'info'
            );
          } else if (priceIncreasedCount > 0) {
            showToast('Added items with updated catalog pricing to Forest Box', 'info');
          } else {
            showToast(`Added items from ${order.orderNumber} to Forest Box`);
          }
        }
      } else {
        if (order.items.length === 1) {
          showToast(`${order.items[0].name} is not available in stock`, 'info');
        } else {
          showToast('Provisions from this order are not available in stock', 'info');
        }
      }
    } finally {
      setReorderingOrderId(null);
    }
  };

  const handleGoToOrderHistory = () => {
    try {
      sessionStorage.setItem('tellervo_scroll_to_orders', 'true');
    } catch {
      // ignore
    }
    setActiveTab('profile');
  };

  const recentTwoOrders = (orders || []).slice(0, 2);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    if (product.id && product.id !== 'lingonberry-birch-sparkler') {
      navigate(`/shop/${product.id}`);
    }
  };

  // Helpers to check featured and most selling status
  const isProductFeatured = (p: any) =>
    Boolean(p.isFeatured || p.is_featured || p.featured);
  const isProductMostSelling = (p: any) =>
    Boolean(p.isMostSelling || p.is_most_selling || p.most_selling);
  const isProductOutOfStock = (p: any) => {
    const rawStatus = (p.status || '').toLowerCase().trim();
    const normalizedStatus = rawStatus.replace(/[\s_-]+/g, '');
    return (
      normalizedStatus === 'outofstock' ||
      rawStatus === 'out of stock' ||
      rawStatus === 'out_of_stock' ||
      rawStatus === 'out-of-stock' ||
      p.stockStatus === 'out-of-stock' ||
      (p.stockCount !== undefined && p.stockCount <= 0) ||
      (p.stock !== undefined && p.stock <= 0)
    );
  };

  const isProductLowStock = (p: any) => {
    if (isProductOutOfStock(p)) return false;
    const rawStatus = (p.status || '').toLowerCase().trim();
    const normalizedStatus = rawStatus.replace(/[\s_-]+/g, '');
    return (
      normalizedStatus === 'lowstock' ||
      rawStatus === 'low stock' ||
      rawStatus === 'low_stock' ||
      rawStatus === 'low-stock' ||
      p.stockStatus === 'low-stock' ||
      (p.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= 5)
    );
  };

  // 1. Featured Section: ONLY products with featured: true (most_selling true/false does not matter)
  const highlightedProducts = products.filter(
    (p) => isProductFeatured(p)
  );

  // 2. Trending Section: ONLY products with most_selling: true (and NOT featured)
  const trendingProducts = products.filter(
    (p) => isProductMostSelling(p) && !isProductFeatured(p)
  );

  // Filter products for Discover Botanical Range
  const discoverProducts = products.filter(p => {
    if (activeCategory === 'adaptogenic') return p.category.includes('ADAPTOGENIC');
    if (activeCategory === 'spritz') return p.category.includes('SPRITZ') || p.category.includes('SPARKLING');
    return ['spruce-needle-lime', 'smoked-lingon-spritz', 'birch-chaga-myrrh', 'taiga-botanical-reserve'].includes(p.id);
  });

  const matchesSearch = (p: Product, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    const nameMatch = (p.name || '').toLowerCase().includes(q);
    const categoryMatch = (p.category || '').toLowerCase().includes(q);
    const notesMatch = (p.notes || '').toLowerCase().includes(q);
    const badgeMatch = (p.badge || '').toLowerCase().includes(q);
    return nameMatch || categoryMatch || notesMatch || badgeMatch;
  };

  // --- Auto-suggestions (Fetches up to 20 similar names & categories based on typed characters) ---
  const [suggestionProducts, setSuggestionProducts] = useState<Product[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

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

    const handleSearchSubmit = (term: string) => {
    const q = term.trim();
    if (!q) return;
    setIsDropdownOpen(false);
    setSelectedSuggestionIndex(-1);
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    setSelectedSuggestionIndex(-1);
  };

  return (
    <div className="pb-28 px-4 pt-3 w-full space-y-5 animate-in fade-in duration-200 relative">
      {/* Search Bar & Auto-Suggestions */}
      <div className="relative w-full z-30">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t.home.searchPlaceholder || 'Search by name or category... (Press Enter)'}
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
                    document.getElementById(`suggestion-item-${next}`)?.scrollIntoView({ block: 'nearest' });
                    return next;
                  });
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (suggestions.length > 0) {
                  setSelectedSuggestionIndex((prev) => {
                    const next = prev > 0 ? prev - 1 : suggestions.length - 1;
                    document.getElementById(`suggestion-item-${next}`)?.scrollIntoView({ block: 'nearest' });
                    return next;
                  });
                }
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (isDropdownOpen && selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                  handleSearchSubmit(suggestions[selectedSuggestionIndex].title);
                } else {
                  handleSearchSubmit(searchQuery);
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
                onClick={handleClearSearch}
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
                  handleSearchSubmit(suggestions[selectedSuggestionIndex].title);
                } else {
                  handleSearchSubmit(searchQuery);
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
        {isDropdownOpen && searchQuery.trim() && (
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
                      id={`suggestion-item-${index}`}
                      type="button"
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      onClick={() => handleSearchSubmit(item.title)}
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

      {/* Backdrop to close suggestions when clicking outside */}
      {isDropdownOpen && searchQuery.trim() && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
      <div>
        {/* Featured Blend Banner: Lingonberry & Birch Bark Sparkler */}
            <div className="relative rounded-3xl overflow-hidden shadow-soft border border-[#E5DFD1] group mt-4">
              <div className="relative h-64 w-full">
                <img
                  src={HERO_FEATURED.imageUrl}
                  alt={HERO_FEATURED.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1E14] via-[#0F1E14]/60 to-transparent" />

                {/* Floating bottle mockup graphic */}
                <div className="absolute right-4 bottom-14 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80"
                    alt="Sparkler bottle"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider rounded-full text-white uppercase border border-white/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5A953]" />
                      {HERO_FEATURED.badge}
                    </span>
                  </div>

                  <div className="max-w-[70%]">
                    <span className="text-[10px] tracking-widest text-[#E5A953] uppercase font-bold block mb-1">
                      {HERO_FEATURED.series}
                    </span>
                    <h3 className="font-editorial text-2xl font-medium leading-tight mb-1.5 text-white">
                      {HERO_FEATURED.title}
                    </h3>
                    <p className="text-[11px] text-[#C4D9CA] line-clamp-2 leading-relaxed">
                      {HERO_FEATURED.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-editorial text-xl font-medium text-white">
                        €{HERO_FEATURED.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#A3BEAC] ml-1">{HERO_FEATURED.unit}</span>
                    </div>
                    <button
                      onClick={() => handleProductClick({
                        id: 'lingonberry-birch-sparkler',
                        name: HERO_FEATURED.title,
                        category: 'WILD HARVEST SERIES',
                        badge: HERO_FEATURED.badge,
                        price: HERO_FEATURED.price,
                        size: '4-pack',
                        description: HERO_FEATURED.description,
                        imageUrl: HERO_FEATURED.imageUrl,
                        notes: 'Wild Lingonberry • Birch Bark Tannin • Effervescent Spring Water',
                        harvestLocation: 'Inari Wilderness, Lapland • 68°54′N',
                      })}
                      className="px-4 py-1.5 bg-white text-[#12281C] rounded-full text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-[#F7F4EB] transition-colors active:scale-95"
                    >
                      <span>{t.home.exploreBlend}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Highlighted Section: Live Featured Products (is_featured: true) */}
          {highlightedProducts.length > 0 && (
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#E5A953]/20 flex items-center justify-center text-[#936622] shadow-2xs">
                    <Sparkles className="w-4 h-4 fill-[#E5A953]/40 text-[#B87A14]" />
                  </div>
                  <div>
                    <h2 className="font-editorial text-lg font-semibold text-[#14261B] leading-tight">
                      Featured Highlights
                    </h2>
                    <p className="text-[11px] text-[#788A7C]">
                      Cellar-curated botanical infusions & favorites
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="text-[11px] font-bold text-[#8C7443] hover:underline flex items-center gap-0.5 shrink-0"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Cards Carousel */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {highlightedProducts.map((product) => {
                  const isFav = favorites.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className="w-56 sm:w-60 shrink-0 bg-white rounded-2xl p-3 border border-[#EAE3D5] shadow-soft-sm flex flex-col justify-between group hover:border-[#D6CEBF] hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      {/* Product Image & Badges */}
                      <div className="relative rounded-xl overflow-hidden aspect-square mb-2.5 bg-[#F6F3EB]">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Featured Gold Badge */}
                        <div className="absolute top-2 left-2 z-10 pointer-events-none flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#FFF9EE]/95 backdrop-blur-sm text-[#8C5D14] border border-[#F5DCB1] shadow-2xs">
                            <Star className="w-2.5 h-2.5 text-[#E5A953] fill-[#E5A953]" />
                            <span>Featured</span>
                          </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          aria-label="Save to favorites"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#21382A] hover:bg-white shadow-sm transition-transform active:scale-90"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isFav ? 'fill-[#C53D43] text-[#C53D43]' : 'text-[#21382A]'
                              }`}
                          />
                        </button>
                      </div>

                      {/* Category & Title */}
                      <div className="flex-1">
                        <div className="text-[9px] font-bold tracking-wider text-[#988151] uppercase mb-0.5 truncate">
                          {product.category || product.notes}
                        </div>
                        <h3 className="font-editorial text-sm font-semibold text-[#14261B] leading-tight line-clamp-2 hover:text-[#285737] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-[#7C8D80] mt-0.5">{product.size}</p>
                      </div>

                      {/* Price & Add to Cart Button */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F0EBE0]">
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
                        {isProductOutOfStock(product) ? (
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#FBF0F0] text-[#932323] border border-[#F5CACA] shadow-2xs whitespace-nowrap">
                            Out of Stock
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            aria-label={`Add ${product.name} to cart`}
                            className="w-7 h-7 rounded-full bg-[#183324] text-[#FAF8F3] flex items-center justify-center hover:bg-[#284B36] active:scale-95 transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trending Section: Products with is_most_selling === true AND is_featured !== true */}
          {trendingProducts.length > 0 && (
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#C84A32]/15 flex items-center justify-center text-[#B23820] shadow-2xs">
                    <Flame className="w-4 h-4 fill-[#C84A32]/40 text-[#B23820]" />
                  </div>
                  <div>
                    <h2 className="font-editorial text-lg font-semibold text-[#14261B] leading-tight">
                      Trending
                    </h2>
                    <p className="text-[11px] text-[#788A7C]">
                      Most loved & highly demanded selections
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="text-[11px] font-bold text-[#A8432D] hover:underline flex items-center gap-0.5 shrink-0"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Cards Carousel */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {trendingProducts.map((product) => {
                  const isFav = favorites.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className="w-56 sm:w-60 shrink-0 bg-white rounded-2xl p-3 border border-[#EAE3D5] shadow-soft-sm flex flex-col justify-between group hover:border-[#D6CEBF] hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      {/* Product Image & Badges */}
                      <div className="relative rounded-xl overflow-hidden aspect-square mb-2.5 bg-[#F6F3EB]">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Trending Badge */}
                        <div className="absolute top-2 left-2 z-10 pointer-events-none flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#FFF4F2]/95 backdrop-blur-sm text-[#A8321D] border border-[#FAD2CB] shadow-2xs">
                            <Flame className="w-2.5 h-2.5 text-[#C84A32] fill-[#C84A32]" />
                            <span>Trending</span>
                          </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          aria-label="Save to favorites"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#21382A] hover:bg-white shadow-sm transition-transform active:scale-90"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isFav ? 'fill-[#C53D43] text-[#C53D43]' : 'text-[#21382A]'
                              }`}
                          />
                        </button>
                      </div>

                      {/* Category & Title */}
                      <div className="flex-1">
                        <div className="text-[9px] font-bold tracking-wider text-[#A8432D] uppercase mb-0.5 truncate">
                          {product.category || product.notes}
                        </div>
                        <h3 className="font-editorial text-sm font-semibold text-[#14261B] leading-tight line-clamp-2 hover:text-[#285737] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-[#7C8D80] mt-0.5">{product.size}</p>
                      </div>

                      {/* Price & Add to Cart Button */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F0EBE0]">
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
                        {isProductOutOfStock(product) ? (
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#FBF0F0] text-[#932323] border border-[#F5CACA] shadow-2xs whitespace-nowrap">
                            Out of Stock
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            aria-label={`Add ${product.name} to cart`}
                            className="w-7 h-7 rounded-full bg-[#183324] text-[#FAF8F3] flex items-center justify-center hover:bg-[#284B36] active:scale-95 transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Again Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#162D1F]" />
                <h2 className="font-editorial text-lg font-medium text-[#14261B]">{t.home.orderAgain}</h2>
              </div>
              <button
                onClick={handleGoToOrderHistory}
                className="text-xs font-semibold text-[#8C7443] hover:underline cursor-pointer"
              >
                {t.home.orderHistory}
              </button>
            </div>

            {/* Horizontal scroll cards */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {recentTwoOrders.length > 0 ? (
                recentTwoOrders.map((order) => {
                  const primaryItem = order.items && order.items.length > 0 ? order.items[0] : null;
                  const matchingProduct = primaryItem
                    ? products.find((p) => p.name.trim().toLowerCase() === primaryItem.name.trim().toLowerCase())
                    : null;
                  const itemImage =
                    primaryItem?.imageUrl ||
                    matchingProduct?.imageUrl ||
                    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=300&q=80';

                  const itemTitle = primaryItem
                    ? order.items.length > 1
                      ? `${primaryItem.name} +${order.items.length - 1} more`
                      : primaryItem.name
                    : order.orderNumber;

                  const packText = primaryItem?.size || (order.items && order.items.length > 1 ? `${order.items.reduce((acc, it) => acc + it.qty, 0)} items` : `${primaryItem?.qty || 1} pack`);
                  const subtitle = `${packText} • €${order.total.toFixed(2)}`;
                  const dateLabel = order.date ? `ORDERED • ${order.date.toUpperCase()}` : 'RECENT DISPATCH';

                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="w-64 shrink-0 bg-white rounded-2xl p-3 border border-[#E9E3D6] shadow-soft-sm flex flex-col justify-between cursor-pointer hover:border-[#183324]/30 hover:shadow-soft transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <img
                          src={itemImage}
                          alt={itemTitle}
                          className="w-14 h-14 rounded-xl object-cover border border-[#EAE4D7] shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold tracking-wider text-[#988151] uppercase block truncate">
                            {dateLabel}
                          </span>
                          <h4 className="font-editorial text-sm font-semibold text-[#183122] truncate">
                            {itemTitle}
                          </h4>
                          <p className="text-[11px] text-[#768779] truncate">{subtitle}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOneTapReorder(order);
                        }}
                        disabled={reorderingOrderId === order.id}
                        className="w-full py-2 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#234330] transition-colors cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                      >
                        {reorderingOrderId === order.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E5A953]" />
                        ) : (
                          <span>{t.home.oneTapReorder}</span>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="w-full py-5 text-center bg-white rounded-2xl border border-[#E9E3D6] text-xs text-[#718274]">
                  No previous orders found. Discover our botanical range below!
                </div>
              )}
            </div>
          </div>

          {/* Discover Botanical Range Section */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="font-editorial text-xl font-medium text-[#14261B]">
                {t.home.discoverRange}
              </h2>
              <span className="text-xs font-medium text-[#7A8C7F]">{t.home.craftBrews}</span>
            </div>
            <p className="text-xs text-[#637568] mb-3">
              {t.home.discoverSub}
            </p>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === 'all'
                  ? 'bg-[#183324] text-white shadow-sm'
                  : 'bg-white border border-[#E5DFD2] text-[#4F6355] hover:bg-[#F7F4EB]'
                  }`}
              >
                {t.home.allBlends}
              </button>
              <button
                onClick={() => setActiveCategory('adaptogenic')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === 'adaptogenic'
                  ? 'bg-[#183324] text-white shadow-sm'
                  : 'bg-white border border-[#E5DFD2] text-[#4F6355] hover:bg-[#F7F4EB]'
                  }`}
              >
                {t.home.adaptogenicTonics}
              </button>
              <button
                onClick={() => setActiveCategory('spritz')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === 'spritz'
                  ? 'bg-[#183324] text-white shadow-sm'
                  : 'bg-white border border-[#E5DFD2] text-[#4F6355] hover:bg-[#F7F4EB]'
                  }`}
              >
                {t.home.wildBerrySpritz}
              </button>
            </div>

            {/* 2x2 Grid of Product Cards */}
            <div className="grid grid-cols-2 gap-3">
              {discoverProducts.map(product => {
                const isFav = favorites.includes(product.id);
                const rawStatus = (product.status || '').toLowerCase();
                const isOutOfStock =
                  rawStatus === 'out of stock' ||
                  rawStatus === 'out_of_stock' ||
                  product.stockStatus === 'out-of-stock' ||
                  (product.stockCount !== undefined && product.stockCount <= 0);

                const isLowStock =
                  !isOutOfStock &&
                  (rawStatus === 'low stock' ||
                    rawStatus === 'low_stock' ||
                    product.stockStatus === 'low-stock' ||
                    (product.stockCount !== undefined &&
                      product.stockCount > 0 &&
                      product.stockCount <= 5));

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-3xl p-3 border border-[#EAE4D7] shadow-soft-sm flex flex-col justify-between group hover:border-[#D6CEBF] transition-all ${isOutOfStock ? 'opacity-90' : ''
                      }`}
                  >
                    {/* Product Image & Top Badges */}
                    <div
                      onClick={() => handleProductClick(product)}
                      className="relative rounded-2xl overflow-hidden aspect-square mb-2.5 bg-[#F6F3EB] cursor-pointer"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80";
                        }}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale-[30%]' : ''
                          }`}
                      />

                      {/* Badges on Card */}
                      <div className="absolute top-2 left-2 z-10 pointer-events-none flex flex-col gap-1">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 bg-[#8B2525]/95 backdrop-blur-sm text-white text-[9px] font-bold tracking-wider rounded-md uppercase shadow-xs">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 bg-[#C97B1A]/95 backdrop-blur-sm text-white text-[9px] font-bold tracking-wider rounded-md uppercase shadow-xs">
                            Limited Stock
                          </span>
                        ) : (product.badge || product.isMostSelling || product.isFeatured) ? (
                          <span className="px-2 py-0.5 bg-[#183324]/90 backdrop-blur-sm text-[#FAF8F3] text-[9px] font-bold tracking-wider rounded-md uppercase shadow-xs">
                            {product.badge || (product.isMostSelling ? 'BESTSELLER' : 'FEATURED')}
                          </span>
                        ) : null}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        aria-label="Save to favorites"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#21382A] hover:bg-white shadow-sm transition-transform active:scale-90"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isFav ? 'fill-[#C53D43] text-[#C53D43]' : 'text-[#21382A]'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div
                        onClick={() => handleProductClick(product)}
                        className="flex items-center gap-1 text-[11px] text-[#55695C] mb-1 cursor-pointer"
                      >
                        <Star className="w-3 h-3 fill-[#E5A953] text-[#E5A953]" />
                        <span className="font-semibold text-[#183122]">{product.rating}</span>
                        <span className="text-[#8B9B90]">({product.reviewsCount})</span>
                      </div>
                    )}

                    {/* Title & Category */}
                    <div
                      onClick={() => handleProductClick(product)}
                      className="flex-1 cursor-pointer"
                    >
                      <h3 className="font-editorial text-sm font-semibold text-[#14261B] leading-tight line-clamp-2 hover:text-[#2A5237] transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-[10px] tracking-wider text-[#8A7142] uppercase font-bold mt-0.5 block">
                        {product.category}
                      </span>

                      {/* Tasting Notes pill */}
                      {product.notes && (
                        <div className="bg-[#F8F6F0] rounded-lg p-1.5 border border-[#EAE4D7] mt-1.5 text-[10px] text-[#637568] line-clamp-1">
                          {product.notes}
                        </div>
                      )}
                    </div>

                    {/* Price and Add / Out of Stock button */}
                    <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-[#F0EBE0]">
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
                      {isOutOfStock ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#FBF0F0] text-[#932323] border border-[#F5CACA] shadow-2xs whitespace-nowrap">
                          Out of Stock
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          aria-label={`Add ${product.name} to cart`}
                          className="w-8 h-8 rounded-full bg-[#183324] text-[#FAF8F3] flex items-center justify-center hover:bg-[#284B36] active:scale-95 transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SENSORY LAB: Find Your Forest Profile Card */}
          <div className="bg-[#FAF7EF] rounded-3xl p-5 border border-[#E9E1CF] shadow-soft-sm relative overflow-hidden flex items-center justify-between">
            <div className="max-w-[65%]">
              <span className="text-[10px] tracking-widest text-[#937548] uppercase font-bold block mb-1">
                {t.home.sensoryLab}
              </span>
              <h3 className="font-editorial text-xl font-medium text-[#14261B] leading-tight mb-1.5">
                {t.home.findProfile}
              </h3>
              <p className="text-xs text-[#637568] mb-3">
                {t.home.findProfileSub}
              </p>
              <button
                onClick={() => setIsQuizOpen(true)}
                className="px-4 py-2 bg-white border border-[#D8CEBA] text-[#183324] rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-[#F3EFE4] transition-colors shadow-sm active:scale-95"
              >
                <span>{t.home.startPairing}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular graphic gauge */}
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#E2DAC8]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#183324]"
                  strokeDasharray="75, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[#183324]">
                <Compass className="w-6 h-6 stroke-[1.8]" />
              </div>
            </div>
          </div>

          {/* Official Tellervo Drinks Emblem & Finnish Proverb Quote Banner */}
          <div className="text-center py-6 px-4 border-t border-[#EAE4D7] space-y-3">
            <div className="w-16 h-16 rounded-full bg-white p-1 border-2 border-[#E5A953]/50 shadow-md flex items-center justify-center mx-auto overflow-hidden">
              <img src="/tellervo-logo.png" alt="Tellervo Drinks - Luonnon Rohdot pullossa" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest text-[#B37F29] uppercase">TELLERVO DRINKS</div>
              <div className="text-[11px] text-[#718575] italic">Luonnon Rohdot pullossa</div>
            </div>
            <blockquote className="font-editorial italic text-base text-[#14261B] max-w-xs mx-auto">
              {t.home.quote}
            </blockquote>
            <p className="text-xs text-[#6A7C6E] max-w-xs mx-auto leading-relaxed">
              {t.home.quoteSub}
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-wider text-[#8A7246] pt-1">
              <span>{t.home.certifiedOrganic}</span>
              <span>•</span>
              <span>{t.home.carbonNegative}</span>
              <span>•</span>
              <span>{t.home.arcticFlora}</span>
            </div>
        </div>

      {/* Explore Blend Modal */}
      {isExploreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsExploreOpen(false)}
            className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 animate-in zoom-in-95 duration-200">
            <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase">
              {HERO_FEATURED.series}
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B] mt-1 mb-2">
              {HERO_FEATURED.title}
            </h3>
            <p className="text-xs text-[#5C6E61] leading-relaxed mb-4">
              {HERO_FEATURED.description}
            </p>
            <div className="bg-white rounded-2xl p-3 border border-[#E8E2D4] space-y-2 mb-5 text-xs text-[#5C6E61]">
              <div className="flex justify-between">
                <span>Foraging Region</span>
                <span className="font-semibold text-[#183122]">Inari, Finnish Lapland</span>
              </div>
              <div className="flex justify-between">
                <span>Steeping Method</span>
                <span className="font-semibold text-[#183122]">72-hour Cold Boreal Infusion</span>
              </div>
              <div className="flex justify-between">
                <span>Alcohol By Volume</span>
                <span className="font-semibold text-[#183122]">0.0% ABV (Zero-Proof)</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  addToCart({
                    id: 'lingonberry-birch-sparkler',
                    name: 'Lingonberry & Birch Bark Sparkler',
                    category: 'WILD HARVEST SERIES',
                    price: 18.50,
                    size: '4-pack',
                    description: HERO_FEATURED.description,
                    imageUrl: HERO_FEATURED.imageUrl,
                  });
                  setIsExploreOpen(false);
                }}
                className="flex-1 py-3 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#234330]"
              >
                Add 4-Pack to Box (€18.50)
              </button>
              <button
                onClick={() => setIsExploreOpen(false)}
                className="px-4 py-3 bg-[#EAE5D9] text-[#283E30] text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
