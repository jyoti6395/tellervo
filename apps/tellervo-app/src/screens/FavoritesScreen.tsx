import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  RotateCcw,
  ShoppingBag,
  Heart,
  Bell,
  AlertTriangle,
  ArrowRight,
  Search,
  X
} from 'lucide-react';

export const FavoritesScreen: React.FC = () => {
  const {
    products,
    favorites,
    isLoadingProducts,
    isLoadingFavorites,
    toggleFavorite,
    addToCart,
    setSelectedProduct,
    showToast,
    triggerConfetti,
    t,
    setActiveTab,
    toggleRestockNotification,
    isRestockNotified
  } = useApp();

  const [stockNotifyOn, setStockNotifyOn] = useState(true);
  const [autoRefillInterval, setAutoRefillInterval] = useState('Every 3 weeks');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter saved items matching populated products
  const savedItems = products.filter(p => favorites.includes(p.id));

  // Extract unique categories dynamically from actual favorite items
  const availableCategories = useMemo(() => {
    const cats = Array.from(
      new Set(
        savedItems
          .map(p => (p.category || '').trim())
          .filter(Boolean)
      )
    );
    return [
      { id: 'all', label: 'All Saved', count: savedItems.length },
      ...cats.map(cat => ({
        id: cat,
        label: cat,
        count: savedItems.filter(p => (p.category || '').trim().toLowerCase() === cat.toLowerCase()).length,
      })),
    ];
  }, [savedItems]);

  // Filter items based on selected category and search query
  const displayedItems = useMemo(() => {
    return savedItems.filter(p => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (p.category || '').trim().toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query) ||
        (p.size || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [savedItems, selectedCategory, searchQuery]);

  // Determine if data is still loading:
  // 1. Initial product catalog loading
  // 2. Initial user favorites query loading
  // 3. Or user has favorited IDs that are currently being populated/fetched
  const isLoading = Boolean(
    isLoadingProducts ||
    isLoadingFavorites ||
    (favorites.length > 0 && savedItems.length < favorites.length)
  );

  return (
    <div className="pb-28 px-4 pt-3 w-full space-y-5 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="font-editorial text-[32px] leading-tight font-medium text-[#14261B]">
          {t.favorites?.myVault || 'My Vault'}
        </h1>

        <p className="text-xs text-[#5D6F61] mt-1">
          {t.favorites?.vaultSub || 'Saved botanical extracts & scheduled auto-deliveries.'}
        </p>
      </div>

      {/* Dynamic Filters for Available Favorite Orders Data */}
      {!isLoading && savedItems.length > 0 && (
        <div className="space-y-2.5">
          {/* Quick Search inside Favorites (if multiple items or searching) */}
          {savedItems.length > 2 && (
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search favorite orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-white border border-[#E5DFD0] rounded-2xl text-xs text-[#1C3122] placeholder-[#8C9C8F] shadow-soft-sm focus:outline-none focus:ring-1 focus:ring-[#183324]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9C8F] hover:text-[#183324]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Dynamic Filter Pills extracted from actual favorite orders */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
              {availableCategories.map(cat => {
                const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${isActive
                        ? 'bg-white text-[#183122] shadow-soft-sm border border-[#DDD6C8] font-bold'
                        : 'bg-[#EDE7DB]/70 text-[#6B7D70] hover:bg-[#E5DFD1]'
                      }`}
                  >
                    <span>{cat.label}</span>
                    <span className={isActive ? 'text-[#183122] font-bold' : 'text-[#7D8F82]'}>
                      ({cat.count})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Skeleton Loading State */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {/* Section Header Skeleton */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="h-3 w-36 bg-[#E8E2D5] rounded" />
            <div className="h-3 w-16 bg-[#E8E2D5] rounded" />
          </div>

          {/* Saved Items List Skeleton */}
          <div className="space-y-3">
            {[1, 2].map(n => (
              <div
                key={n}
                className="bg-white rounded-3xl p-3.5 border border-[#E9E3D6] shadow-soft-sm space-y-3"
              >
                <div className="flex gap-3 items-start">
                  <div className="w-20 h-20 rounded-2xl bg-[#EFEAE0] shrink-0" />

                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="flex justify-between items-start">
                      <div className="h-4 bg-[#EFEAE0] rounded-md w-3/5" />
                      <div className="w-4 h-4 bg-[#EFEAE0] rounded-full" />
                    </div>
                    <div className="h-3 bg-[#EFEAE0] rounded w-4/5" />
                    <div className="flex items-center gap-2 pt-1">
                      <div className="h-4 bg-[#EFEAE0] rounded w-16" />
                      <div className="h-3.5 bg-[#EFEAE0] rounded w-24" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F2ECE1] flex justify-between items-center">
                  <div className="h-7 w-28 bg-[#EFEAE0] rounded-xl" />
                  <div className="h-7 w-24 bg-[#EFEAE0] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : savedItems.length > 0 ? (
        <>
          {/* Saved Forest Provisions Header */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[11px] font-bold tracking-wider text-[#816C46] uppercase">
              SAVED FOREST PROVISIONS
            </span>
            <span className="text-[11px] text-[#78887C]">
              {displayedItems.length === savedItems.length
                ? `${savedItems.length} shown`
                : `${displayedItems.length} of ${savedItems.length} shown`}
            </span>
          </div>

          {/* Saved Items List */}
          {displayedItems.length > 0 ? (
            <div className="space-y-3">
              {displayedItems.map(item => {
                const rawStatus = (item.status || '').toLowerCase();
                const isOutOfStock =
                  rawStatus === 'out of stock' ||
                  rawStatus === 'out_of_stock' ||
                  item.stockStatus === 'out-of-stock' ||
                  (item.stockCount !== undefined && item.stockCount <= 0);

                const isLowStock =
                  !isOutOfStock &&
                  (rawStatus === 'low stock' ||
                    rawStatus === 'low_stock' ||
                    item.stockStatus === 'low-stock' ||
                    (item.stockCount !== undefined && item.stockCount > 0 && item.stockCount <= 5));

                const origPrice = item.originalPrice ?? ((item as any).original_price ? Number((item as any).original_price) : undefined);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-3 sm:p-4 border border-[#ECE5D8] shadow-soft-sm flex gap-3.5 sm:gap-4 items-center group transition-all hover:border-[#DFD7C7] hover:shadow-md"
                  >
                    {/* Left Column: Proportioned Image with volume badge */}
                    <div
                      onClick={() => setSelectedProduct(item)}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-[#F6F3EB] border border-[#EFE9DC] cursor-pointer"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80";
                        }}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale-[30%]' : ''}`}
                      />
                      {item.size && (
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-[#2B1B12]/85 backdrop-blur-sm text-white text-[9px] font-bold rounded tracking-wider">
                          {item.size.replace(/\s+/g, '')}
                        </span>
                      )}
                    </div>

                    {/* Right Column: Title + Heart on Top, Badge in Middle, Price on Left + Button on Right */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5 self-stretch py-0.5">
                      {/* Row 1: Title and Favorite Heart */}
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => setSelectedProduct(item)}
                          className="font-editorial text-base sm:text-lg font-bold text-[#14261B] leading-tight truncate cursor-pointer hover:text-[#285739] transition-colors"
                        >
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          className="text-[#9E2A2B] p-1 -mr-1 hover:opacity-75 transition-opacity cursor-pointer shrink-0"
                          title="Remove from favorites"
                        >
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-[#9E2A2B]" />
                        </button>
                      </div>

                      {/* Row 2: Stock Availability Badge */}
                      <div className="flex items-center gap-2">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 bg-[#F5E6E6] text-[#8B2525] font-semibold text-[10px] rounded-md flex items-center gap-1 border border-[#EACDCD]">
                            <AlertTriangle className="w-3 h-3 text-[#8B2525]" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-0.5 bg-[#D3BEAA] text-[#3D2514] font-semibold text-[10px] rounded-md flex items-center gap-1 shadow-2xs">
                            <AlertTriangle className="w-3 h-3 text-[#3D2514]" />
                            <span>Limited Stock: Only {item.stockCount || 20} left</span>
                          </span>
                        ) : item.stockStatus === 'just-restocked' ? (
                          <span className="text-[10px] text-[#245D36] font-semibold bg-[#EAF4ED] px-2 py-0.5 rounded-md">
                            • Just Restocked
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#296D3E] font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#296D3E]" />
                            In Stock
                          </span>
                        )}
                      </div>

                      {/* Row 3: Balanced Bottom Bar (Price on Left, Action Button on Right) */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-editorial text-base sm:text-lg font-bold text-[#14261B]">
                            €{item.price.toFixed(2)}
                          </span>
                          {origPrice && origPrice > item.price && (
                            <span className="text-xs text-[#8C9B8E] line-through font-normal">
                              €{origPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {isOutOfStock ? (
                          <button
                            type="button"
                            onClick={() => toggleRestockNotification(item.id, item.name)}
                            aria-label={`Notify when ${item.name} is back in stock`}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                              isRestockNotified(item.id)
                                ? 'bg-[#EBF4EE] text-[#1D4E31] border border-[#C5DEC9]'
                                : 'bg-[#FAF4E8] text-[#9A6218] border border-[#ECD9B7] hover:bg-[#F4ECDA]'
                            }`}
                          >
                            <Bell className={`w-3.5 h-3.5 ${isRestockNotified(item.id) ? 'fill-[#245D36] text-[#245D36]' : 'text-[#C97B1A]'}`} />
                            <span>{isRestockNotified(item.id) ? 'Notified' : 'Notify Me'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="px-4 sm:px-5 py-1.5 bg-[#143222] hover:bg-[#204933] text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-[#FAF8F3]" />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-[#E9E3D6] text-center space-y-2">
              <p className="text-xs text-[#6F8073]">No provisions matching this filter in your vault.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-[#183122] underline"
              >
                Clear filter & show all ({savedItems.length})
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 border border-[#E9E3D6] text-center space-y-4 shadow-soft-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#F6F3EB] text-[#183324] flex items-center justify-center mx-auto border border-[#E5DFD2]">
            <Heart className="w-8 h-8 text-[#988A75]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-editorial text-xl font-semibold text-[#183324]">
              Your Forest Vault is Empty
            </h3>
            <p className="text-xs text-[#6F8073] max-w-xs mx-auto leading-relaxed">
              Tap the heart icon on any botanical provision in the shop to save your favorites here for 1-tap reordering.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#183324] text-white text-xs font-bold rounded-2xl hover:bg-[#254632] active:scale-95 transition-all shadow-soft-sm"
          >
            <span>Explore Provisions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
