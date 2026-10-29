import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../routes/hooks/useNavigation';
import { stockService } from '@tellervo/supabase';
import { Bell, ChevronLeft, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Star, 
  Plus, 
  Minus, 
  Compass, 
  Sparkles, 
  Wine, 
  Clock, 
  Leaf, 
  Truck,
  AlertCircle } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    favorites, 
    toggleFavorite, 
    showToast,
    triggerConfetti,
    t,
    toggleRestockNotification,
    isRestockNotified
  } = useApp();

  const { currentPath, navigate } = useNavigation();

  const [quantity, setQuantity] = useState(1);
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReserving, setIsReserving] = useState(false);
  const [isStockUnavailable, setIsStockUnavailable] = useState(false);
  const [stockNotice, setStockNotice] = useState<string | null>(null);

  // Reset reservation notice on product switch
  useEffect(() => {
    setIsStockUnavailable(false);
    setStockNotice(null);
  }, [selectedProduct?.id]);

  const handleBack = () => {
    setSelectedProduct(null);
    if (currentPath.startsWith('/shop/')) {
      navigate('/shop');
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/shop');
    }
  };

  // Keyboard shortcut: close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPath]);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const isFav = favorites.includes(product.id);

  // Pack options (only if defined in product data)
  const packOptions = product.packOptions && product.packOptions.length > 0 ? product.packOptions : null;
  const currentOption = packOptions ? (packOptions[selectedPackIndex] || packOptions[0]) : null;
  const unitPrice = currentOption ? currentOption.price : (product.discountPrice ?? product.price);
  const totalPrice = (unitPrice * quantity).toFixed(2);

  // Gallery images (strictly from product data without fake placeholder photos)
  const gallery = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const rawStatus = (product.status || '').toLowerCase().trim();
  const normalizedStatus = rawStatus.replace(/[\s_-]+/g, '');
  const isOutOfStock =
    normalizedStatus === 'outofstock' ||
    rawStatus === 'out of stock' ||
    rawStatus === 'out_of_stock' ||
    rawStatus === 'out-of-stock' ||
    product.stockStatus === 'out-of-stock' ||
    (product.stockCount !== undefined && product.stockCount <= 0);

  const isLowStock =
    !isOutOfStock &&
    (normalizedStatus === 'lowstock' ||
      rawStatus === 'low stock' ||
      rawStatus === 'low_stock' ||
      rawStatus === 'low-stock' ||
      product.stockStatus === 'low-stock' ||
      (product.stockCount !== undefined && product.stockCount > 0 && product.stockCount <= 5));

  const isEffectiveOutOfStock = isOutOfStock || isStockUnavailable;

  const handleAddToCart = () => {
    if (isEffectiveOutOfStock) {
      showToast(`${product.name} is currently out of stock`, 'info');
      return;
    }

    addToCart(
      {
        ...product,
        price: unitPrice,
        size: currentOption ? currentOption.label : product.size,
      },
      quantity
    );
    triggerConfetti();
    handleBack();
  };

  /**
   * Buy Now Flow:
   * 1. User clicks Buy Now
   * 2. Backend checks available stock from real-time database
   * 3. Reserve stock atomically ("Ek bottle sirf ek order ko mil sakti hai")
   * 4. Stock available -> Proceed to payment (/checkout)
   *    Stock unavailable -> Halt payment and show "Notify Me"
   */
  const handleBuyNow = async () => {
    if (isEffectiveOutOfStock) {
      toggleRestockNotification(product.id, product.name);
      return;
    }

    try {
      setIsReserving(true);
      setStockNotice(null);

      // Step 2: Backend checks available stock from real-time database
      showToast('Checking real-time cellar stock...', 'info');
      const check = await stockService.checkAvailableStock(product.id, quantity);

      if (!check.isAvailable) {
        // Step 4 Branch B: Stock unavailable -> Payment roko; Notify Me dikhao.
        setIsStockUnavailable(true);
        setStockNotice(check.message || `${product.name} is out of stock`);
        showToast(`Stock unavailable for ${product.name}. Payment halted.`, 'info');
        return;
      }

      // Step 3: Reserve stock atomically ("Ek bottle sirf ek order ko mil sakti hai")
      const reservation = await stockService.reserveProductStock(product.id, quantity);

      if (!reservation.success) {
        // Step 4 Branch B: Stock unavailable -> Payment roko; Notify Me dikhao.
        setIsStockUnavailable(true);
        setStockNotice(reservation.message || 'Could not reserve stock');
        showToast(reservation.message || 'Item just ran out of stock! Payment halted.', 'info');
        return;
      }

      // Step 4 Branch A: Stock available -> Payment process karo.
      showToast(`Stock reserved! Proceeding to payment...`, 'success');
      addToCart(
        {
          ...product,
          price: unitPrice,
          size: currentOption ? currentOption.label : product.size,
        },
        quantity
      );
      setSelectedProduct(null);
      navigate('/checkout');
    } catch (err) {
      console.error('[ProductDetailModal] Error in Buy Now flow:', err);
      showToast('Failed to verify stock with server', 'info');
    } finally {
      setIsReserving(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      showToast('Link copied to clipboard!');
    }
  };

  return (
    <div 
      onClick={handleBack}
      className="fixed inset-0 z-50 flex justify-center bg-[#0E1D14]/70 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#FBF9F5] h-full flex flex-col overflow-hidden relative shadow-2xl animate-in slide-in-from-bottom duration-300 cursor-default"
      >
        {/* Detail Page Sticky Header */}
        <header className="sticky top-0 z-20 bg-[#FBF9F5]/90 backdrop-blur-md px-4 py-3 border-b border-[#EBE6DC] flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to previous screen"
            className="w-9 h-9 rounded-full bg-white border border-[#E5DFD0] flex items-center justify-center text-[#1C3224] hover:bg-[#F6F3EB] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center max-w-[200px]">
            {product.category && (
              <span className="text-[10px] font-bold tracking-widest text-[#967C46] uppercase truncate">
                {product.category}
              </span>
            )}
            <span className="font-editorial text-sm font-semibold text-[#162D1F] truncate">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share product"
              className="w-9 h-9 rounded-full bg-white border border-[#E5DFD0] flex items-center justify-center text-[#1C3224] hover:bg-[#F6F3EB] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              aria-label="Save to vault"
              className="w-9 h-9 rounded-full bg-white border border-[#E5DFD0] flex items-center justify-center text-[#1C3224] hover:bg-[#F6F3EB] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${isFav ? 'fill-[#C53D43] text-[#C53D43]' : 'text-[#1C3224]'}`}
              />
            </button>
            {isOutOfStock && (
              <button
                type="button"
                onClick={() => toggleRestockNotification(product.id, product.name)}
                aria-label={isRestockNotified(product.id) ? 'Restock notification set' : 'Notify when in stock'}
                title={isRestockNotified(product.id) ? 'Restock notification active' : 'Notify when active again'}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 ${
                  isRestockNotified(product.id)
                    ? 'bg-[#EBF4EE] border-[#C5DEC9] text-[#245D36]'
                    : 'bg-[#FAF4E8] border-[#ECD9B7] text-[#9A6218] hover:bg-[#F4ECDA]'
                }`}
              >
                <Bell className={`w-4 h-4 ${isRestockNotified(product.id) ? 'fill-[#245D36]' : 'text-[#C97B1A]'}`} />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Detail Body */}
        <div className="flex-1 overflow-y-auto pb-28">
          {/* Hero Image Showcase */}
          <div className="relative px-4 pt-3 pb-2">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-[#F2ECE1] shadow-soft-sm border border-[#E8E2D5]">
              {gallery[activeImageIndex] ? (
                <img
                  src={gallery[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8C7A58] text-xs font-semibold">
                  No Image Available
                </div>
              )}

              {/* Badges on Hero */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {isOutOfStock ? (
                  <span className="px-2.5 py-1 bg-[#8B2525] text-white text-[10px] font-bold tracking-wider rounded-lg uppercase shadow-sm">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-2.5 py-1 bg-[#C97B1A] text-white text-[10px] font-bold tracking-wider rounded-lg uppercase shadow-sm">
                    Limited Stock
                  </span>
                ) : product.badge ? (
                  <span className="px-2.5 py-1 bg-[#183324] text-white text-[10px] font-bold tracking-wider rounded-lg uppercase shadow-sm">
                    {product.badge}
                  </span>
                ) : null}

                {product.harvestLocation && (
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-[#22442E] text-[10px] font-bold rounded-lg border border-white/40 flex items-center gap-1 shadow-sm">
                    <Compass className="w-3 h-3 text-[#E5A953]" />
                    <span>{product.harvestLocation}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Thumbnails (only shown if there are multiple real images) */}
            {gallery.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#183324] ring-2 ring-[#E5A953]/30 scale-105'
                        : 'border-[#E5DFD0] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Header Information */}
          <div className="px-5 pt-2 space-y-3">
            <div>
              {product.category && (
                <span className="text-[10px] font-bold tracking-wider text-[#2E683E] uppercase block mb-1">
                  {product.category}
                </span>
              )}

              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#14261B] leading-tight">
                {product.name}
              </h1>

              {/* Price & Size display */}
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-editorial text-2xl font-bold text-[#14261B]">
                  €{unitPrice.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#9EAFA2] line-through">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.size && (
                  <span className="text-xs text-[#7A8C7F] font-medium ml-1">
                    • {product.size}
                  </span>
                )}
              </div>

              {/* Rating & Reviews row (rendered only if actual rating exists) */}
              {product.rating ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 fill-[#E5A953] text-[#E5A953]" />
                    <span className="font-bold text-[#14261B]">{product.rating}</span>
                    {product.reviewsCount ? (
                      <span className="text-[#7F9283]">({product.reviewsCount} verified reviews)</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Description Paragraph */}
            {product.description && (
              <p className="text-xs text-[#5D6F61] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Tasting Notes (rendered only if actual notes exist) */}
            {product.notes && (
              <div className="bg-[#FAF7EF] rounded-2xl p-3 border border-[#E9E0CE] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#D49B4E] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-[#183122]">{t.detail.tastingNotes}</div>
                  <div className="text-[#718576] mt-0.5">{product.notes}</div>
                </div>
              </div>
            )}

            {/* Pack Size / Format Selector (rendered only if pack options are defined) */}
            {packOptions && packOptions.length > 0 && (
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
                        type="button"
                        onClick={() => setSelectedPackIndex(idx)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
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
            )}

            {/* Sensory & Flavor Balance Meters (rendered only if actual flavorProfile exists) */}
            {product.flavorProfile && (
              <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3 pt-4">
                <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#A67C37]" />
                  <span>{t.detail.sensoryProfile}</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {[
                    { label: t.detail.forestAromatics, value: product.flavorProfile.aromatics, max: 5 },
                    { label: t.detail.effervescence, value: product.flavorProfile.effervescence, max: 5 },
                    { label: t.detail.bitterness, value: product.flavorProfile.bitterness, max: 5 },
                    { label: t.detail.sweetness, value: product.flavorProfile.sweetness, max: 5 },
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
            )}

            {/* Pure Botanical Ingredients & Nutritional Facts (rendered only if present) */}
            {(product.ingredients?.length || product.nutrition) && (
              <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3">
                {product.ingredients && product.ingredients.length > 0 && (
                  <>
                    <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-[#2E683E]" />
                      <span>{t.detail.ingredientsTitle}</span>
                    </h3>

                    <ul className="space-y-1.5 text-xs text-[#5D6F61]">
                      {product.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E5A953] shrink-0" />
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Nutrition Grid */}
                {product.nutrition && (
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#F0EBE0] text-center">
                    {product.nutrition.calories && (
                      <div className="p-2 rounded-xl bg-[#FAF8F3]">
                        <div className="text-[10px] text-[#869689]">{t.detail.energy}</div>
                        <div className="text-xs font-bold text-[#183122]">{product.nutrition.calories}</div>
                      </div>
                    )}
                    {product.nutrition.sugar && (
                      <div className="p-2 rounded-xl bg-[#FAF8F3]">
                        <div className="text-[10px] text-[#869689]">{t.detail.sugars}</div>
                        <div className="text-xs font-bold text-[#183122]">{product.nutrition.sugar}</div>
                      </div>
                    )}
                    {product.nutrition.abv && (
                      <div className="p-2 rounded-xl bg-[#FAF8F3]">
                        <div className="text-[10px] text-[#869689]">{t.detail.alcohol}</div>
                        <div className="text-xs font-bold text-[#183122]">{product.nutrition.abv}</div>
                      </div>
                    )}
                    {product.nutrition.volume && (
                      <div className="p-2 rounded-xl bg-[#FAF8F3]">
                        <div className="text-[10px] text-[#869689]">{t.detail.volume}</div>
                        <div className="text-xs font-bold text-[#183122]">{product.nutrition.volume}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Serving Ritual (rendered only if present) */}
            {product.servingRitual && (
              <div className="bg-[#FAF7F0] rounded-3xl p-4 border border-[#E9E1CE] shadow-soft-sm space-y-2">
                <h3 className="font-editorial text-base font-semibold text-[#14261B] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#A67C37]" />
                  <span>{t.detail.serveRitualTitle}</span>
                </h3>
                <p className="text-xs text-[#5D6F61] leading-relaxed">
                  {product.servingRitual}
                </p>
              </div>
            )}

            {/* Delivery Guarantee */}
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
        <div className="sticky bottom-0 z-30 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#EAE4D7] shadow-float">
          {stockNotice && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-[#FFF6E6] border border-[#F0D5A8] text-xs text-[#8A5012] flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#C97B1A]" />
                <span className="font-medium">{stockNotice}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A86414] bg-[#F7E7C8] px-2 py-0.5 rounded">
                Payment Halted
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1.5 bg-[#F6F3EB] rounded-2xl p-1.5 border border-[#E5DFD0]">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={isEffectiveOutOfStock || quantity <= 1 || isReserving}
                aria-label="Decrease quantity"
                className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#253D2E] shadow-xs hover:bg-[#FDFBF7] disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-[#1A2F22] w-5 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                disabled={isEffectiveOutOfStock || isReserving}
                aria-label="Increase quantity"
                className="w-7 h-7 rounded-xl bg-[#183324] flex items-center justify-center text-white shadow-xs hover:bg-[#274633] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Buttons */}
            {isEffectiveOutOfStock ? (
              <button
                type="button"
                onClick={() => toggleRestockNotification(product.id, product.name)}
                aria-label={isRestockNotified(product.id) ? 'Restock notification set' : 'Notify when active again'}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98] ${
                  isRestockNotified(product.id)
                    ? 'bg-[#EBF4EE] text-[#1B462C] border border-[#C5DEC9]'
                    : 'bg-[#FAF4E8] text-[#9A6218] border border-[#ECD9B7] hover:bg-[#F4ECDA]'
                }`}
              >
                <Bell className={`w-4 h-4 ${isRestockNotified(product.id) ? 'fill-[#245D36] text-[#245D36]' : 'text-[#C97B1A]'}`} />
                <span>{isRestockNotified(product.id) ? 'Notification Set • We’ll Notify You' : 'Notify Me When Active Again'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isReserving}
                  className="py-3.5 px-3 bg-[#F6F3EB] hover:bg-[#EAE5D9] text-[#183324] border border-[#D9D1C1] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  title="Add to Forest Box"
                >
                  <ShoppingBag className="w-4 h-4 text-[#183324]" />
                  <span className="hidden sm:inline">Add to Box</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isReserving}
                  className="flex-1 py-3.5 bg-[#183324] text-[#FAF8F3] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#254632] active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-75"
                >
                  {isReserving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-[#E5A953] border-t-transparent rounded-full animate-spin" />
                      <span>Checking Stock...</span>
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#E5A953]" />
                      <span>Buy Now</span>
                      <span>•</span>
                      <span>€{totalPrice}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
