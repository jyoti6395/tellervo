import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Truck, 
  Zap, 
  RotateCcw, 
  ShoppingBag, 
  Heart, 
  Bell, 
  AlertTriangle,
  ArrowRight
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
    setActiveTab
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'refills' | 'stock'>('all');
  const [stockNotifyOn, setStockNotifyOn] = useState(true);
  const [autoRefillInterval, setAutoRefillInterval] = useState('Every 3 weeks');

  // Filter saved items matching populated products
  const savedItems = products.filter(p => favorites.includes(p.id));

  // Determine if data is still loading:
  // 1. Initial product catalog loading
  // 2. Initial user favorites query loading
  // 3. Or user has favorited IDs that are currently being populated/fetched
  const isLoading = Boolean(
    isLoadingProducts ||
    isLoadingFavorites ||
    (favorites.length > 0 && savedItems.length < favorites.length)
  );

  const refillsCount = savedItems.filter(p => !!p.autoRefillOptions).length;
  const stockCount = savedItems.filter(p => p.stockStatus === 'just-restocked' || p.stockStatus === 'low-stock').length;

  const filteredSavedItems = savedItems.filter(p => {
    if (activeTabFilter === 'refills') return !!p.autoRefillOptions;
    if (activeTabFilter === 'stock') return p.stockStatus === 'just-restocked' || p.stockStatus === 'low-stock';
    return true;
  });

  const vaultTotal = savedItems.reduce((sum, item) => sum + item.price, 0);

  const handleReorderAllFavorites = () => {
    if (savedItems.length === 0) return;
    savedItems.forEach(item => {
      addToCart(item);
    });
    triggerConfetti();
    showToast(`Added ${savedItems.length} vault favorites to Forest Box!`);
  };

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

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTabFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTabFilter === 'all'
              ? 'bg-white text-[#183122] shadow-soft-sm border border-[#DDD6C8] font-bold'
              : 'bg-[#EDE7DB]/70 text-[#6B7D70] hover:bg-[#E5DFD1]'
          }`}
        >
          {t.favorites?.allSaved || 'All Saved'} {isLoading ? '' : `(${savedItems.length})`}
        </button>

        <button
          onClick={() => setActiveTabFilter('refills')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTabFilter === 'refills'
              ? 'bg-white text-[#183122] shadow-soft-sm border border-[#DDD6C8] font-bold'
              : 'bg-[#EDE7DB]/70 text-[#6B7D70] hover:bg-[#E5DFD1]'
          }`}
        >
          {t.favorites?.autoRefills || 'Auto-Refills'} {isLoading ? '' : `(${refillsCount})`}
        </button>

        <button
          onClick={() => setActiveTabFilter('stock')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTabFilter === 'stock'
              ? 'bg-white text-[#183122] shadow-soft-sm border border-[#DDD6C8] font-bold'
              : 'bg-[#EDE7DB]/70 text-[#6B7D70] hover:bg-[#E5DFD1]'
          }`}
        >
          {t.favorites?.backInStock || 'Stock Alert'} {isLoading ? '' : `(${stockCount})`}
        </button>
      </div>

      {/* Skeleton Loading State */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {/* Nordic Ritual Bundle Hero Restock Card Skeleton */}
          <div className="bg-[#183324] text-white rounded-3xl p-5 shadow-soft border border-[#264833] space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-2.5 w-24 bg-white/20 rounded" />
                <div className="h-6 w-44 bg-white/20 rounded-md" />
              </div>
              <div className="h-7 w-20 bg-white/20 rounded-md" />
            </div>

            <div className="h-8 w-full bg-white/10 rounded-xl" />
            <div className="h-11 w-full bg-[#E5A953]/60 rounded-2xl" />
          </div>

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
          {/* Nordic Ritual Bundle Hero Restock Card */}
          <div className="bg-[#183324] text-white rounded-3xl p-5 shadow-soft border border-[#264833] relative overflow-hidden space-y-3.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#E5A953] uppercase block mb-0.5">
                  VAULT RESTOCK
                </span>
                <h3 className="font-editorial text-2xl font-medium text-white leading-tight">
                  1-Tap Restock All Vault
                </h3>
              </div>
              <div className="text-right">
                <span className="font-editorial text-2xl font-bold text-white">€{vaultTotal.toFixed(2)}</span>
                <span className="text-xs text-[#95B69F] line-through ml-1.5">€{(vaultTotal * 1.15).toFixed(2)}</span>
              </div>
            </div>

            {/* Chilled delivery badge */}
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between text-xs text-[#D1E8D9]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#E5A953]" />
                <span>Qualifies for Free Subarctic Chilled Delivery</span>
              </span>
              <span className="text-[10px] font-bold text-[#E5A953] tracking-wider">ACTIVE</span>
            </div>

            {/* 1-Tap CTA button */}
            <button
              onClick={handleReorderAllFavorites}
              className="w-full py-3.5 bg-[#E5A953] text-[#12281C] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3B966] active:scale-[0.98] transition-all shadow-md"
            >
              <Zap className="w-4 h-4 fill-[#12281C]" />
              <span>1-Tap Reorder All Favorites ({savedItems.length})</span>
            </button>
          </div>

          {/* Saved Forest Provisions Header */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[11px] font-bold tracking-wider text-[#816C46] uppercase">
              SAVED FOREST PROVISIONS
            </span>
            <span className="text-[11px] text-[#78887C]">{filteredSavedItems.length} shown</span>
          </div>

          {/* Saved Items List */}
          {filteredSavedItems.length > 0 ? (
            <div className="space-y-3">
              {filteredSavedItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-3.5 border border-[#E9E3D6] shadow-soft-sm space-y-3 group"
                >
                  {/* Top row: Image & Title */}
                  <div className="flex gap-3 items-start">
                    <div 
                      onClick={() => setSelectedProduct(item)}
                      className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-[#F6F3EB] cursor-pointer"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80";
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold rounded">
                        {item.size}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 
                          onClick={() => setSelectedProduct(item)}
                          className="font-editorial text-base font-semibold text-[#162E1F] leading-tight truncate cursor-pointer hover:text-[#255435] transition-colors"
                        >
                          {item.name}
                        </h4>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="text-[#C53D43] p-1 -mr-1 hover:opacity-75"
                          title="Remove from favorites"
                        >
                          <Heart className="w-4 h-4 fill-[#C53D43]" />
                        </button>
                      </div>

                      <p className="text-[11px] text-[#718274] line-clamp-1 mt-0.5">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-editorial text-sm font-bold text-[#14261B]">
                          €{item.price.toFixed(2)}
                        </span>
                        {item.stockStatus === 'in-stock' && (
                          <span className="text-[10px] text-[#296D3E] font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#296D3E]" />
                            In Stock
                          </span>
                        )}
                        {item.stockStatus === 'low-stock' && (
                          <span className="text-[10px] text-[#B56722] font-semibold bg-[#FAF0E4] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock: Only {item.stockCount || 5} left
                          </span>
                        )}
                        {item.stockStatus === 'just-restocked' && (
                          <span className="text-[10px] text-[#245D36] font-semibold bg-[#EAF4ED] px-2 py-0.5 rounded-md">
                            • Just Restocked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#F2ECE1]">
                    {item.autoRefillOptions ? (
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="relative">
                          <select
                            value={autoRefillInterval}
                            onChange={e => setAutoRefillInterval(e.target.value)}
                            className="text-xs bg-[#F7F4EC] border border-[#E0D7C6] rounded-xl px-2.5 py-1.5 font-medium text-[#293F31] focus:outline-none"
                          >
                            {item.autoRefillOptions.map(opt => (
                              <option key={opt} value={opt}>Auto-Refill: {opt}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-3.5 py-1.5 bg-[#183324] text-white text-xs font-semibold rounded-xl flex items-center gap-1 hover:bg-[#254632]"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reorder</span>
                        </button>
                      </div>
                    ) : item.stockStatus === 'just-restocked' || item.stockStatus === 'low-stock' ? (
                      <div className="flex items-center justify-between w-full gap-2">
                        <button
                          onClick={() => {
                            setStockNotifyOn(!stockNotifyOn);
                            showToast(stockNotifyOn ? 'Stock alert turned off' : 'Stock alert activated!');
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-colors ${
                            stockNotifyOn
                              ? 'bg-[#EBF3EE] border-[#CFDFD4] text-[#1D4B2D]'
                              : 'bg-white border-[#DDD6C8] text-[#637568]'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>{stockNotifyOn ? 'Stock Alert On' : 'Alert When Low'}</span>
                        </button>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-1.5 bg-[#183324] text-white text-xs font-semibold rounded-xl flex items-center gap-1 hover:bg-[#254632]"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[11px] text-[#346B46] font-medium flex items-center gap-1">
                          🌿 Botanical Reserve
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-1.5 bg-[#183324] text-white text-xs font-semibold rounded-xl flex items-center gap-1 hover:bg-[#254632]"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-[#E9E3D6] text-center space-y-2">
              <p className="text-xs text-[#6F8073]">No provisions matching this filter in your vault.</p>
              <button
                onClick={() => setActiveTabFilter('all')}
                className="text-xs font-semibold text-[#183122] underline"
              >
                View all saved items ({savedItems.length})
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
