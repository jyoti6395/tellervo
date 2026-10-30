import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HERO_FEATURED } from '../data/mockData';
import {
  Search,
  SlidersHorizontal,
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

export const HomeScreen: React.FC = () => {
  const {
    products,
    addToCart,
    favorites,
    toggleFavorite,
    setActiveTab,
    setIsQuizOpen,
    setSelectedProduct,
    t
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'adaptogenic' | 'spritz'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

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

  return (
    <div className="pb-28 px-4 pt-3 w-full space-y-5 animate-in fade-in duration-200">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.home.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5DFD0] rounded-2xl text-xs text-[#1C3122] placeholder-[#8C9C8F] shadow-soft-sm focus:outline-none focus:ring-1 focus:ring-[#183324]"
          />
        </div>
        <button
          onClick={() => setActiveTab('shop')}
          aria-label="Filter products"
          className="w-10 h-10 rounded-2xl bg-white border border-[#E5DFD0] flex items-center justify-center text-[#2A3E31] shadow-soft-sm hover:bg-[#F8F5EE] active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

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
                  onClick={() => setSelectedProduct({
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
                  onClick={() => setSelectedProduct(product)}
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
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-[#C53D43] text-[#C53D43]' : 'text-[#21382A]'
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
                  onClick={() => setSelectedProduct(product)}
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
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-[#C53D43] text-[#C53D43]' : 'text-[#21382A]'
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
            onClick={() => setActiveTab('profile')}
            className="text-xs font-semibold text-[#8C7443] hover:underline"
          >
            {t.home.orderHistory}
          </button>
        </div>

        {/* Horizontal scroll cards */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {/* Card 1 */}
          <div className="w-64 shrink-0 bg-white rounded-2xl p-3 border border-[#E9E3D6] shadow-soft-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2.5">
              <img
                src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=300&q=80"
                alt="Arctic Juniper Tonic"
                className="w-14 h-14 rounded-xl object-cover border border-[#EAE4D7]"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold tracking-wider text-[#988151] uppercase block">
                  {t.home.lastOrdered5d}
                </span>
                <h4 className="font-editorial text-sm font-semibold text-[#183122] truncate">
                  Arctic Juniper Tonic
                </h4>
                <p className="text-[11px] text-[#768779]">4-pack • €14.50</p>
              </div>
            </div>
            <button
              onClick={() => {
                const p = products.find(prod => prod.id === 'arctic-juniper-tonic') || products[0];
                if (p) addToCart(p);
              }}
              className="w-full py-2 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#234330] transition-colors"
            >
              <span>{t.home.oneTapReorder}</span>
            </button>
          </div>

          {/* Card 2 */}
          <div className="w-64 shrink-0 bg-white rounded-2xl p-3 border border-[#E9E3D6] shadow-soft-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2.5">
              <img
                src="https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=300&q=80"
                alt="Wild Cloudberry"
                className="w-14 h-14 rounded-xl object-cover border border-[#EAE4D7]"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold tracking-wider text-[#988151] uppercase block">
                  {t.home.lastOrdered18d}
                </span>
                <h4 className="font-editorial text-sm font-semibold text-[#183122] truncate">
                  Cloudberry Golden
                </h4>
                <p className="text-[11px] text-[#768779]">4-pack • €18.00</p>
              </div>
            </div>
            <button
              onClick={() => {
                const p = products.find(prod => prod.id === 'cloudberry-golden-sparkler') || products[1] || products[0];
                if (p) addToCart(p);
              }}
              className="w-full py-2 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#234330] transition-colors"
            >
              <span>{t.home.oneTapReorder}</span>
            </button>
          </div>
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
                  onClick={() => setSelectedProduct(product)}
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
                    onClick={() => setSelectedProduct(product)}
                    className="flex items-center gap-1 text-[11px] text-[#55695C] mb-1 cursor-pointer"
                  >
                    <Star className="w-3 h-3 fill-[#E5A953] text-[#E5A953]" />
                    <span className="font-semibold text-[#183122]">{product.rating}</span>
                    <span className="text-[#8B9B90]">({product.reviewsCount})</span>
                  </div>
                )}

                {/* Title & Category */}
                <div
                  onClick={() => setSelectedProduct(product)}
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
