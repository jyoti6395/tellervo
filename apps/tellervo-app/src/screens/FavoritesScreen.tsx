import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Check, 
  Sparkles, 
  Truck, 
  Zap, 
  Clock, 
  RotateCcw, 
  ShoppingBag, 
  Heart, 
  Bell, 
  ChevronDown, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Compass
} from 'lucide-react';

export const FavoritesScreen: React.FC = () => {
  const { 
    products, 
    favorites, 
    toggleFavorite, 
    addToCart, 
    setSelectedProduct,
    showToast, 
    triggerConfetti,
    t
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'refills' | 'stock'>('all');
  const [stockNotifyOn, setStockNotifyOn] = useState(true);
  const [autoRefillInterval, setAutoRefillInterval] = useState('Every 3 weeks');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Filter saved items
  const savedItems = products.filter(p => favorites.includes(p.id));

  const filteredSavedItems = savedItems.filter(p => {
    if (activeTabFilter === 'refills') return !!p.autoRefillOptions;
    if (activeTabFilter === 'stock') return p.stockStatus === 'just-restocked';
    return true;
  });

  const handleReorderAllFavorites = () => {
    savedItems.forEach(item => {
      addToCart(item);
    });
    triggerConfetti();
    showToast(`Added ${savedItems.length} vault favorites to Forest Box!`);
  };

  return (
    <div className="pb-28 px-4 pt-3 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Title & Vault Status */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase mb-1">
          <span className="text-[#847350]">{t.favorites.personalCellar}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#CFE2D4] text-[#245233] text-[10px] font-bold flex items-center gap-1.5 normal-case">
            <span className="w-1.5 h-1.5 rounded-full bg-[#277E46] animate-pulse" />
            <span>{t.favorites.vaultSynced}</span>
          </span>
        </div>

        <h1 className="font-editorial text-[32px] leading-tight font-medium text-[#14261B]">
          {t.favorites.myVault} <span className="text-xl font-normal text-[#6F8273]">({savedItems.length} {t.favorites.savedCount})</span>
        </h1>

        <p className="text-xs text-[#5D6F61] mt-1">
          {t.favorites.vaultSub}
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
          {t.favorites.allSaved} ({savedItems.length})
        </button>

        <button
          onClick={() => setActiveTabFilter('refills')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTabFilter === 'refills'
              ? 'bg-white text-[#183122] shadow-soft-sm border border-[#DDD6C8] font-bold'
              : 'bg-[#EDE7DB]/70 text-[#6B7D70] hover:bg-[#E5DFD1]'
          }`}
        >
          {t.favorites.autoRefills} (1)
        </button>

        <button
          onClick={() => setActiveTabFilter('stock')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTabFilter === 'stock'
              ? 'bg-white text-[#183122] shadow-soft-sm border border-[#DDD6C8] font-bold'
              : 'bg-[#EDE7DB]/70 text-[#6B7D70] hover:bg-[#E5DFD1]'
          }`}
        >
          {t.favorites.backInStock} (1)
        </button>
      </div>

      {/* Nordic Ritual Bundle Hero Restock Card */}
      <div className="bg-[#183324] text-white rounded-3xl p-5 shadow-soft border border-[#264833] relative overflow-hidden space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#E5A953] uppercase block mb-0.5">
              NORDIC RITUAL BUNDLE
            </span>
            <h3 className="font-editorial text-2xl font-medium text-white leading-tight">
              1-Tap Restock All Vault
            </h3>
          </div>
          <div className="text-right">
            <span className="font-editorial text-2xl font-bold text-white">€38.50</span>
            <span className="text-xs text-[#95B69F] line-through ml-1.5">€46.00</span>
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
          <span>1-Tap Reorder All Favorites</span>
        </button>
      </div>

      {/* Saved Forest Provisions Header */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-[11px] font-bold tracking-wider text-[#816C46] uppercase">
          SAVED FOREST PROVISIONS
        </span>
        <span className="text-[11px] text-[#78887C]">Swipe card to remove</span>
      </div>

      {/* Saved Items List */}
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
                      Low Stock: Only {item.stockCount || 14} left
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

            {/* Reminder pill if present */}
            {item.lastOrderedText && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#FAF7F0] rounded-xl border border-[#ECE4D5] text-[11px] text-[#7A6B48]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.lastOrderedText}</span>
                </span>
                <span className="font-bold text-[#8A5B22]">[Due soon]</span>
              </div>
            )}

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
              ) : item.stockStatus === 'just-restocked' ? (
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
                    <span>{stockNotifyOn ? 'Stock Notify On' : 'Notify When Low'}</span>
                  </button>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-4 py-1.5 bg-[#183324] text-white text-xs font-semibold rounded-xl flex items-center gap-1 hover:bg-[#254632]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ) : item.badge === '100% WILD CRAFTED' ? (
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-[11px] text-[#346B46] font-medium flex items-center gap-1">
                    🌿 100% Wild Crafted
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-3.5 py-1.5 bg-[#183324] text-white text-xs font-semibold rounded-xl flex items-center gap-1 hover:bg-[#254632]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Reorder Now</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-[11px] text-[#7F6B48] italic">
                    Limited autumn distillation
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

      {/* Perfect Pair Pairing Card */}
      <div className="bg-[#FAF7EF] rounded-3xl p-4 border border-[#E9E0CE] shadow-soft-sm">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="font-bold text-[#866D3E] flex items-center gap-1.5 text-[11px] tracking-wider uppercase">
            <span>🥢</span>
            <span>PERFECT PAIR PAIRING</span>
          </span>
          <span className="font-bold text-[#183122]">+€5.00</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80"
              alt="Forest Botanicals Garnish"
              className="w-12 h-12 rounded-xl object-cover border border-[#E6DECF]"
            />
            <div>
              <h4 className="font-editorial text-sm font-semibold text-[#183122]">
                Forest Botanicals Garnish
              </h4>
              <p className="text-[11px] text-[#718274]">Pairs with your Arctic Juniper</p>
            </div>
          </div>

          <button
            onClick={() => {
              addToCart({
                id: 'forest-garnish-pairing',
                name: 'Forest Botanicals Garnish',
                category: 'GARNISH & BOTANICALS',
                price: 5.00,
                size: '40g Tin',
                description: 'Dried juniper berries, spruce needles, and wild cranberry crisps.',
                imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80',
              });
            }}
            className="px-3.5 py-1.5 bg-[#E5A953] text-[#12281C] rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#F3B966] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Expand Your Vault Accordion */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-soft-sm overflow-hidden">
        <button
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF8F3] transition-colors"
        >
          <div>
            <h4 className="font-editorial text-base font-semibold text-[#14261B]">
              Expand Your Vault
            </h4>
            <p className="text-xs text-[#6F8073]">
              Hand-foraged seasonal batches trending this week
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#6A7B6F] transition-transform duration-200 ${
              isAccordionOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isAccordionOpen && (
          <div className="p-4 pt-0 border-t border-[#F2EDE2] space-y-3">
            {[
              {
                id: 'lingon-shrub',
                name: 'Lingonberry Cold Shrub',
                desc: 'Raw apple cider vinegar infused with foraged red berries.',
                price: 16.00,
              },
              {
                id: 'pine-bitters',
                name: 'Highland Pine Needle Bitters',
                desc: 'Aromatic cocktail tincture crafted in small glass carboys.',
                price: 22.00,
              },
            ].map(rec => (
              <div
                key={rec.id}
                className="flex items-center justify-between py-2 border-b border-[#F5EFE4] last:border-0"
              >
                <div>
                  <div className="text-xs font-bold text-[#183122]">{rec.name}</div>
                  <div className="text-[11px] text-[#718274]">{rec.desc}</div>
                </div>
                <button
                  onClick={() => {
                    addToCart({
                      id: rec.id,
                      name: rec.name,
                      category: 'CELLAR EXCLUSIVE',
                      price: rec.price,
                      size: 'Bottle',
                      description: rec.desc,
                      imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80',
                    });
                  }}
                  className="px-2.5 py-1 bg-[#183324] text-white text-[11px] font-semibold rounded-lg shrink-0 ml-3"
                >
                  + €{rec.price.toFixed(2)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
