import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { 
  ChevronLeft, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Star, 
  Plus, 
  Minus, 
  Check, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  Trees, 
  Wine, 
  Clock, 
  Leaf, 
  Truck,
  RotateCcw
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    favorites, 
    toggleFavorite, 
    cartCount, 
    setIsCartOpen,
    showToast,
    triggerConfetti,
    t
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const isFav = favorites.includes(product.id);

  // Default pack options if not explicitly set
  const packOptions = product.packOptions || [
    { label: product.size || 'Standard Pack', count: 1, price: product.price },
    { label: '4-Pack Box', count: 4, price: Number((product.price * 3.8).toFixed(2)), savings: 'Save 5%' },
    { label: '12-Pack Cellar Vault', count: 12, price: Number((product.price * 10.5).toFixed(2)), savings: 'Save 15%' },
  ];

  const currentOption = packOptions[selectedPackIndex] || packOptions[0];
  const totalPrice = (currentOption.price * quantity).toFixed(2);

  // Gallery images with reliable fallbacks
  const gallery = [
    product.imageUrl,
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  ];

  const flavorProfile = product.flavorProfile || {
    bitterness: 3,
    sweetness: 1,
    aromatics: 5,
    effervescence: 4,
  };

  const ingredients = product.ingredients || [
    'Cold-Pressed Spring Spruce Tips (Picea abies)',
    'Subarctic Wild Lime & Lingonberry Juice',
    'Raw Mountain Birch Sap (Betula pendula)',
    'Crystalline Nordic Spring Water',
    'Wild Juniper & Rowanberry Extract',
  ];

  const nutrition = product.nutrition || {
    calories: '14 kcal / 100ml',
    sugar: '0.8g (natural fruit sugars)',
    abv: product.badge === '0.0% ABV' ? '0.0% ABV' : '0.0% ABV (Zero-Proof)',
    volume: product.size || '275ml',
  };

  const handleAddToCart = () => {
    // Add product to cart with custom pack label
    addToCart({
      ...product,
      name: currentOption.count > 1 ? `${product.name} (${currentOption.label})` : product.name,
      price: currentOption.price,
      size: currentOption.label,
    }, quantity);
    triggerConfetti();
    setSelectedProduct(null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      showToast('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#0E1D14]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBF9F5] h-full flex flex-col overflow-hidden relative shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Detail Page Sticky Header */}
        <header className="sticky top-0 z-20 bg-[#FBF9F5]/90 backdrop-blur-md px-4 py-3 border-b border-[#EBE6DC] flex items-center justify-between">
          <button
            onClick={() => setSelectedProduct(null)}
            aria-label="Back to previous screen"
            className="w-9 h-9 rounded-full bg-white border border-[#E5DFD0] flex items-center justify-center text-[#1C3224] hover:bg-[#F6F3EB] active:scale-95 transition-all shadow-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center max-w-[200px]">
            <span className="text-[10px] font-bold tracking-widest text-[#967C46] uppercase truncate">
              {product.category}
            </span>
            <span className="font-editorial text-sm font-semibold text-[#162D1F] truncate">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              aria-label="Share product"
              className="w-9 h-9 rounded-full bg-white border border-[#E5DFD0] flex items-center justify-center text-[#1C3224] hover:bg-[#F6F3EB] active:scale-95 transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              aria-label="Save to vault"
              className="w-9 h-9 rounded-full bg-white border border-[#E5DFD0] flex items-center justify-center text-[#1C3224] hover:bg-[#F6F3EB] active:scale-95 transition-all shadow-xs"
            >
              <Heart
                className={`w-4 h-4 ${isFav ? 'fill-[#C53D43] text-[#C53D43]' : 'text-[#1C3224]'}`}
              />
            </button>
          </div>
        </header>

        {/* Scrollable Detail Body */}
        <div className="flex-1 overflow-y-auto pb-28">
          {/* Hero Image Showcase */}
          <div className="relative px-4 pt-3 pb-2">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-[#F2ECE1] shadow-soft-sm border border-[#E8E2D5]">
              <img
                src={gallery[activeImageIndex]}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80";
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Badges on Hero */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="px-2.5 py-1 bg-[#183324] text-white text-[10px] font-bold tracking-wider rounded-lg uppercase shadow-sm">
                    {product.badge}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-[#22442E] text-[10px] font-bold rounded-lg border border-white/40 flex items-center gap-1 shadow-sm">
                  <Compass className="w-3 h-3 text-[#E5A953]" />
                  <span>{product.harvestLocation || 'Inari Boreal Taiga • 68°54′N'}</span>
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#183324] ring-2 ring-[#E5A953]/30 scale-105'
                      : 'border-[#E5DFD0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80";
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Header Information */}
          <div className="px-5 pt-2 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-widest text-[#A17C3D] uppercase">
                  {t.detail.wildHarvestSeries}
                </span>
                <span className="text-[#C4BCAB]">•</span>
                <span className="text-[10px] font-bold tracking-wider text-[#2E683E] uppercase">
                  {product.category}
                </span>
              </div>

              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#14261B] leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews row */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3.5 h-3.5 fill-[#E5A953] text-[#E5A953]" />
                  <span className="font-bold text-[#14261B]">{product.rating || 4.9}</span>
                  <span className="text-[#7F9283]">({product.reviewsCount || 128} verified reviews)</span>
                </div>
                <span className="text-[#D3CBBF]">•</span>
                <span className="text-xs text-[#28643C] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.detail.wildForaged}</span>
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs text-[#5D6F61] leading-relaxed">
              {product.description}
            </p>

            {/* Tasting Notes Pill Card */}
            {product.notes && (
              <div className="bg-[#FAF7EF] rounded-2xl p-3 border border-[#E9E0CE] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#D49B4E] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-[#183122]">{t.detail.tastingNotes}</div>
                  <div className="text-[#718576] mt-0.5">{product.notes}</div>
                </div>
              </div>
            )}

            {/* Pack Size / Format Selector */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#14261B] uppercase tracking-wider block mb-2">
                {t.detail.selectFormat}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {packOptions.map((opt, idx) => {
                  const isSelected = selectedPackIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedPackIndex(idx)}
                      className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-[#183324] bg-[#183324] text-white shadow-soft-sm'
                          : 'border-[#E6E0D2] bg-white text-[#1C3224] hover:border-[#D0C4B0]'
                      }`}
                    >
                      {opt.savings && (
                        <span className={`absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                          isSelected ? 'bg-[#E5A953] text-[#14261B]' : 'bg-[#EAF3ED] text-[#246138]'
                        }`}>
                          {opt.savings}
                        </span>
                      )}
                      <div className="text-xs font-bold truncate">{opt.label}</div>
                      <div className={`text-xs mt-1 font-semibold ${
                        isSelected ? 'text-[#E5A953]' : 'text-[#183122]'
                      }`}>
                        €{opt.price.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sensory & Flavor Balance Meters */}
            <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3 pt-4">
              <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
                <Wine className="w-4 h-4 text-[#A67C37]" />
                <span>{t.detail.sensoryProfile}</span>
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { label: t.detail.forestAromatics, value: flavorProfile.aromatics, max: 5 },
                  { label: t.detail.effervescence, value: flavorProfile.effervescence, max: 5 },
                  { label: t.detail.bitterness, value: flavorProfile.bitterness, max: 5 },
                  { label: t.detail.sweetness, value: flavorProfile.sweetness, max: 5 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#55695C]">
                      <span>{item.label}</span>
                      <span className="font-bold text-[#14261B]">{item.value} / {item.max}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EFECE3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#183324] rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pure Botanical Ingredients & Nutritional Facts */}
            <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3">
              <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#2E683E]" />
                <span>{t.detail.ingredientsTitle}</span>
              </h3>

              <ul className="space-y-1.5 text-xs text-[#5D6F61]">
                {ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5A953] shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>

              {/* Nutrition Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#F0EBE0] text-center">
                <div className="p-2 rounded-xl bg-[#FAF8F3]">
                  <div className="text-[10px] text-[#869689]">{t.detail.energy}</div>
                  <div className="text-xs font-bold text-[#183122]">{nutrition.calories.split(' ')[0]}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF8F3]">
                  <div className="text-[10px] text-[#869689]">{t.detail.sugars}</div>
                  <div className="text-xs font-bold text-[#183122]">{nutrition.sugar.split(' ')[0]}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF8F3]">
                  <div className="text-[10px] text-[#869689]">{t.detail.alcohol}</div>
                  <div className="text-xs font-bold text-[#183122]">{nutrition.abv.split(' ')[0]}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF8F3]">
                  <div className="text-[10px] text-[#869689]">{t.detail.volume}</div>
                  <div className="text-xs font-bold text-[#183122]">{nutrition.volume}</div>
                </div>
              </div>
            </div>

            {/* The Nordic Serve Ritual */}
            <div className="bg-[#FAF7F0] rounded-3xl p-4 border border-[#E9E1CE] shadow-soft-sm space-y-2">
              <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A67C37]" />
                <span>{t.detail.serveRitualTitle}</span>
              </h3>
              <p className="text-xs text-[#5D6F61] leading-relaxed">
                {product.servingRitual || 'Serve ice cold (4°C) in a chilled crystal tumbler over hand-cut ice. Garnish with a fresh bruised pine sprig or a sliver of Meyer lemon peel to release aromatic boreal terpenes.'}
              </p>
            </div>

            {/* Courier Guarantee */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#EAF3ED] border border-[#CFE3D5] text-xs text-[#20492E]">
              <Truck className="w-5 h-5 shrink-0 text-[#246138]" />
              <div>
                <span className="font-bold">{t.detail.chilledDelivery}</span>
                <p className="text-[11px] text-[#4F735B]">
                  {t.detail.chilledDeliverySub}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="sticky bottom-0 z-30 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#EAE4D7] flex items-center gap-3 shadow-float">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-[#F6F3EB] rounded-2xl p-1.5 border border-[#E5DFD0]">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#253D2E] shadow-xs hover:bg-[#FDFBF7] disabled:opacity-40"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-[#1A2F22] w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
              className="w-7 h-7 rounded-xl bg-[#183324] flex items-center justify-center text-white shadow-xs hover:bg-[#274633]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Box CTA Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 bg-[#183324] text-[#FAF8F3] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#254632] active:scale-[0.98] transition-all shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-[#E5A953]" />
            <span>{t.detail.addToBox}</span>
            <span>•</span>
            <span>€{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
