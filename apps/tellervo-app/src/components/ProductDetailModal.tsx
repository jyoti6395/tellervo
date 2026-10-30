import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigation } from '../routes/hooks/useNavigation';
import { stockService } from '@tellervo/supabase';
import {
  Bell, ChevronLeft, ChevronRight,
  Heart,
  Share2,
  ShoppingBag,
  Star,
  Flame,
  Plus,
  Minus,
  Compass,
  Sparkles,
  Wine,
  Clock,
  Leaf,
  Truck,
  ZoomIn,
  Package,
  Sun,
  AlertCircle
} from 'lucide-react';

const getAromaticsDescriptor = (val: number) => {
  if (val <= 1) return 'Delicate & Subtle';
  if (val === 2) return 'Light Herbal';
  if (val === 3) return 'Rich Pine & Moss';
  if (val === 4) return 'Bold Botanical';
  return 'Intense Forest';
};

const getEffervescenceDescriptor = (val: number) => {
  if (val <= 1) return 'Still & Smooth';
  if (val === 2) return 'Gentle Petillant';
  if (val === 3) return 'Crisp Sparkle';
  if (val === 4) return 'Lively Fizz';
  return 'Vibrant Bubbles';
};

const getBitternessDescriptor = (val: number) => {
  if (val <= 1) return 'Soft & Silky';
  if (val === 2) return 'Mild Tannins';
  if (val === 3) return 'Structured Grip';
  if (val === 4) return 'Bold & Earthy';
  return 'Deeply Tannic';
};

const getSweetnessDescriptor = (val: number) => {
  if (val <= 1) return 'Bone Dry (0g)';
  if (val === 2) return 'Dry & Crisp';
  if (val === 3) return 'Balanced Semi-Dry';
  if (val === 4) return 'Subtly Sweet';
  return 'Lush Honeyed';
};

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

  // Instant 1:1 Desktop Cursor & Mobile Thumb Touch Magnifier
  const [isZooming, setIsZooming] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = thumbnailScrollRef.current.clientWidth * 0.75;
      thumbnailScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Universal coordinate updater for both mouse cursor and mobile touch
  const updateZoomPosition = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

    if (imgRef.current) {
      imgRef.current.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      imgRef.current.style.transform = 'scale(2.5)';
    }
    if (lensRef.current) {
      lensRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }
  };

  // Mouse handlers (Desktop cursor)
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateZoomPosition(e.clientX, e.clientY, e.currentTarget);
  };

  const handleImageMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    updateZoomPosition(e.clientX, e.clientY, e.currentTarget);
    setIsZooming(true);
  };

  const handleImageMouseLeave = () => {
    if (imgRef.current) {
      imgRef.current.style.transform = 'scale(1)';
    }
    setIsZooming(false);
  };

  // Touch handlers (Mobile thumb tracking)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    updateZoomPosition(touch.clientX, touch.clientY, e.currentTarget);
    setIsZooming(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    updateZoomPosition(touch.clientX, touch.clientY, e.currentTarget);
  };

  const handleTouchEnd = () => {
    if (imgRef.current) {
      imgRef.current.style.transform = 'scale(1)';
    }
    setIsZooming(false);
  };

  // Reset reservation notice and zoom on product switch
  useEffect(() => {
    setIsStockUnavailable(false);
    setStockNotice(null);
    setIsZooming(false);
    if (imgRef.current) {
      imgRef.current.style.transform = 'scale(1)';
    }
  }, [selectedProduct?.id]);

  // Auto-scroll active thumbnail into view in horizontal strip
  useEffect(() => {
    const activeThumb = document.getElementById(`gallery-thumb-${activeImageIndex}`);
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeImageIndex]);

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

  // Auto-switch pack size if currently selected pack option has less stock than needed
  useEffect(() => {
    if (!selectedProduct) return;
    const availStock = typeof selectedProduct.stockCount === 'number' ? selectedProduct.stockCount : 20;
    const isOut =
      (selectedProduct.status || '').toLowerCase().trim().replace(/[\s_-]+/g, '') === 'outofstock' ||
      selectedProduct.stockStatus === 'out-of-stock' ||
      availStock <= 0;
    if (availStock > 0 && !isOut && !isStockUnavailable) {
      const basePrice = selectedProduct.discountPrice ?? selectedProduct.price ?? 0;
      const opts = selectedProduct.packOptions && selectedProduct.packOptions.length > 0
        ? selectedProduct.packOptions
        : [
            { label: '1 Bottle', count: 1, price: Number(basePrice.toFixed(2)) },
            { label: '3 Bottles', count: 3, price: Number((basePrice * 3 * 0.95).toFixed(2)) },
            { label: '5 Bottles', count: 5, price: Number((basePrice * 5 * 0.90).toFixed(2)) },
          ];
      const isCurrentAvailable = availStock >= (opts[selectedPackIndex]?.count || 1);
      if (!isCurrentAvailable) {
        const firstAvailableIdx = opts.findIndex((opt) => availStock >= opt.count);
        if (firstAvailableIdx !== -1) {
          setSelectedPackIndex(firstAvailableIdx);
        }
      }
    }
  }, [selectedProduct, isStockUnavailable, selectedPackIndex]);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const isFav = favorites.includes(product.id);

  // Available stock count
  const availableStock = typeof product.stockCount === 'number' ? product.stockCount : 20;

  // Base unit price & original price (for pack price calculations)
  const baseUnitPrice = product.discountPrice ?? product.price ?? 0;
  const baseOriginalPrice = product.originalPrice ?? product.price ?? 0;

  // Dynamic pack options (1 Bottle, 3 Bottles, 5 Bottles based on available stock)
  const packOptions = product.packOptions && product.packOptions.length > 0
    ? product.packOptions.map((opt) => ({
        ...opt,
        originalPrice: opt.originalPrice ?? Number((baseOriginalPrice * opt.count).toFixed(2)),
      }))
    : [
        {
          label: '1 Bottle',
          count: 1,
          price: Number(baseUnitPrice.toFixed(2)),
          originalPrice: baseOriginalPrice > baseUnitPrice ? Number(baseOriginalPrice.toFixed(2)) : undefined,
          savings: undefined,
        },
        {
          label: '3 Bottles',
          count: 3,
          price: Number((baseUnitPrice * 3 * 0.95).toFixed(2)),
          originalPrice: Number((baseOriginalPrice * 3).toFixed(2)),
          savings: 'Save 5%',
        },
        {
          label: '5 Bottles',
          count: 5,
          price: Number((baseUnitPrice * 5 * 0.90).toFixed(2)),
          originalPrice: Number((baseOriginalPrice * 5).toFixed(2)),
          savings: 'Save 10%',
        },
      ];

  const currentOption = packOptions[selectedPackIndex] || packOptions[0];
  const unitPrice = currentOption.price;
  const currentOriginalPackPrice = currentOption.originalPrice;
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

    const totalBottles = (currentOption?.count || 1) * quantity;
    if (availableStock > 0 && totalBottles > availableStock) {
      showToast(`Only ${availableStock} bottles available in stock`, 'info');
      return;
    }

    addToCart(
      {
        ...product,
        name: currentOption && currentOption.count > 1 ? `${product.name} (${currentOption.label})` : product.name,
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

      const totalBottles = (currentOption?.count || 1) * quantity;
      // Step 2: Backend checks available stock from real-time database
      showToast('Checking real-time cellar stock...', 'info');
      const check = await stockService.checkAvailableStock(product.id, totalBottles);

      if (!check.isAvailable) {
        // Step 4 Branch B: Stock unavailable -> Payment roko; Notify Me dikhao.
        setIsStockUnavailable(true);
        setStockNotice(check.message || `${product.name} is out of stock`);
        showToast(`Stock unavailable for ${product.name}. Payment halted.`, 'info');
        return;
      }

      // Step 3: Reserve stock atomically ("Ek bottle sirf ek order ko mil sakti hai")
      const reservation = await stockService.reserveProductStock(product.id, totalBottles);

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
      }).catch(() => { });
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
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 ${isRestockNotified(product.id)
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
          {/* Hero Image Showcase with Instant Cursor & Mobile Thumb Magnifier */}
          <div className="relative px-4 pt-3 pb-2">
            <div
              onMouseEnter={handleImageMouseEnter}
              onMouseLeave={handleImageMouseLeave}
              onMouseMove={handleImageMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className="relative rounded-3xl overflow-hidden aspect-square bg-[#F6F3EB] shadow-soft-sm border border-[#E8E2D5] cursor-crosshair group select-none touch-none flex items-center justify-center"
            >
              {/* Soft ambient blur backdrop to seamlessly blend any aspect ratio without empty bars */}
              {gallery[activeImageIndex] && (
                <img
                  src={gallery[activeImageIndex]}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-25 pointer-events-none select-none"
                />
              )}

              {/* Full Uncropped Main Image */}
              {gallery[activeImageIndex] ? (
                <img
                  ref={imgRef}
                  src={gallery[activeImageIndex]}
                  alt={product.name}
                  className="relative z-10 w-full h-full object-contain pointer-events-none"
                  style={{
                    willChange: 'transform, transform-origin',
                    transition: isZooming ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8C7A58] text-xs font-semibold">
                  No Image Available
                </div>
              )}

              {/* Instant Magnifier Loupe Reticle (Tracks cursor or thumb with translate3d) */}
              {gallery[activeImageIndex] && (
                <div
                  ref={lensRef}
                  className={`absolute top-0 left-0 pointer-events-none w-24 h-24 rounded-full border-2 border-white/95 shadow-[0_0_25px_rgba(0,0,0,0.35)] ring-1 ring-black/20 bg-white/10 backdrop-brightness-110 z-20 ${isZooming ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-150`}
                  style={{
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0) translate(-50%, -50%)',
                  }}
                />
              )}

              {/* Zoom Status Hint Pill */}
              {gallery[activeImageIndex] && (
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1.5 pointer-events-none transition-all duration-200 shadow-sm z-20">
                  <ZoomIn className="w-3 h-3 text-[#E5A953]" />
                  <span>{isZooming ? 'Inspecting section' : 'Touch & drag to inspect'}</span>
                </div>
              )}

              {/* Badges on Hero */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-20">
                {isOutOfStock ? (
                  <span className="px-2.5 py-1 bg-[#8B2525] text-white text-[10px] font-bold tracking-wider rounded-lg uppercase shadow-sm">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-2.5 py-1 bg-[#C97B1A] text-white text-[10px] font-bold tracking-wider rounded-lg uppercase shadow-sm">
                    Limited Stock
                  </span>
                ) : null}
                {/* product.badge ? (
                  <span className="px-2.5 py-1 bg-[#183324] text-white text-[10px] font-bold tracking-wider rounded-lg uppercase shadow-sm">
                    {product.badge}
                  </span> */}

                {product.harvestLocation && (
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-[#22442E] text-[10px] font-bold rounded-lg border border-white/40 flex items-center gap-1 shadow-sm">
                    <Compass className="w-3 h-3 text-[#E5A953]" />
                    <span>{product.harvestLocation}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Thumbnails with Left/Right Arrows and 4 Images per view */}
            {gallery.length > 1 && (
              <div className="mt-3 flex items-center gap-1.5 px-0.5">
                {/* Left Arrow Icon */}
                {gallery.length > 4 && (
                  <button
                    type="button"
                    onClick={() => scrollThumbnails('left')}
                    aria-label="Previous thumbnails"
                    className="w-7 h-7 rounded-full bg-white border border-[#E5DFD0] text-[#14261B] shadow-xs flex items-center justify-center shrink-0 hover:bg-[#F6F3EB] active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Thumbnails Scroll Strip (4 images visible, scrollbar hidden) */}
                <div
                  ref={thumbnailScrollRef}
                  className="flex-1 overflow-x-auto no-scrollbar scroll-smooth py-1 flex"
                >
                  <div className={`flex items-center gap-2 ${gallery.length <= 4 ? 'mx-auto' : 'w-max'} px-1`}>
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        id={`gallery-thumb-${idx}`}
                        type="button"
                        onClick={() => {
                          setActiveImageIndex(idx);
                          if (imgRef.current) {
                            imgRef.current.style.transform = 'scale(1)';
                          }
                          setIsZooming(false);
                        }}
                        className={`w-14 h-14 sm:w-16 sm:h-16 aspect-square shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${activeImageIndex === idx
                          ? 'border-[#183324] ring-2 ring-[#E5A953]/30 scale-105 shadow-sm'
                          : 'border-[#E5DFD0] opacity-70 hover:opacity-100 hover:border-[#183324]/40'
                          }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Arrow Icon */}
                {gallery.length > 4 && (
                  <button
                    type="button"
                    onClick={() => scrollThumbnails('right')}
                    aria-label="Next thumbnails"
                    className="w-7 h-7 rounded-full bg-white border border-[#E5DFD0] text-[#14261B] shadow-xs flex items-center justify-center shrink-0 hover:bg-[#F6F3EB] active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Product Header Information & Content Sections */}
          <div className="px-5 pt-2 space-y-6 sm:space-y-7">
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
                {currentOriginalPackPrice && currentOriginalPackPrice > unitPrice && (
                  <span className="text-sm text-[#9EAFA2] line-through">
                    €{currentOriginalPackPrice.toFixed(2)}
                  </span>
                )}
                {product.size && (
                  <span className="text-xs text-[#7A8C7F] font-medium ml-1">
                    • {currentOption.count > 1 ? `${currentOption.count} × ${product.size}` : product.size}
                  </span>
                )}
              </div>

              {/* Badges below price: Featured, Most Selling, or any custom badge */}
              {(() => {
                const isMostSelling = Boolean(product.isMostSelling || (product as any).is_most_selling || (product as any).most_selling);
                const rawBadge = (product.badge || '').trim();
                const normalizedBadge = rawBadge.toUpperCase();
                const showCustomBadge = Boolean(
                  rawBadge &&
                  (!isMostSelling || (normalizedBadge !== 'MOST SELLING' && normalizedBadge !== 'BESTSELLER'))
                );

                if (!isMostSelling && !showCustomBadge) return null;

                return (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {/* Featured Badge */}
                    {/* {isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FFF9EE] text-[#8C5D14] border border-[#F5DCB1] shadow-2xs">
                        <Star className="w-3 h-3 text-[#E5A953] fill-[#E5A953]" />
                        <span>Featured</span>
                      </span>
                    )} */}

                    {/* Most Selling Badge */}
                    {isMostSelling && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FDF2F0] text-[#9C2C25] border border-[#F8CEC9] shadow-2xs">
                        <Flame className="w-3 h-3 text-[#D94F45] fill-[#D94F45]" />
                        <span>Most Selling</span>
                      </span>
                    )}

                    {/* Custom Badge */}
                    {showCustomBadge && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F0F5F1] text-[#1E4A2F] border border-[#CFE0D4] shadow-2xs">
                        <Sparkles className="w-3 h-3 text-[#2E683E]" />
                        <span>{rawBadge}</span>
                      </span>
                    )}
                  </div>
                );
              })()}

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

            {/* Pack Size Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#14261B] uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#E5A953]" />
                  <span>Select Pack Size</span>
                </span>
                <span className="text-[11px] text-[#7A8C7F]">
                  {availableStock > 0 ? (
                    <span className="text-[#246138] font-semibold">{availableStock} in stock</span>
                  ) : (
                    <span className="text-[#8B2525] font-semibold">Out of stock</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                {packOptions.map((opt, idx) => {
                  const isSelected = selectedPackIndex === idx;
                  const isPackAvailable = availableStock >= opt.count && !isEffectiveOutOfStock;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isPackAvailable}
                      onClick={() => setSelectedPackIndex(idx)}
                      className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        !isPackAvailable
                          ? 'border-[#E5DFD0] bg-[#F4F0E8]/80 cursor-not-allowed select-none'
                          : isSelected
                            ? 'border-[#183324] bg-[#183324] text-white shadow-soft-sm scale-[1.02] cursor-pointer'
                            : 'border-[#E6E0D2] bg-white text-[#1C3224] hover:border-[#183324]/40 hover:bg-[#FAF8F5] cursor-pointer'
                      }`}
                    >
                      {/* Savings Tag */}
                      {opt.savings && isPackAvailable && (
                        <span
                          className={`absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-xs z-10 pointer-events-none ${
                            isSelected ? 'bg-[#E5A953] text-[#14261B]' : 'bg-[#EAF3ED] text-[#246138]'
                          }`}
                        >
                          {opt.savings}
                        </span>
                      )}

                      {/* Card Info (Faded when Out of Stock) */}
                      <div className={`transition-opacity duration-200 ${!isPackAvailable ? 'opacity-20' : ''}`}>
                        <div className={`text-xs font-bold truncate ${isSelected && isPackAvailable ? 'text-white' : 'text-[#14261B]'}`}>
                          {opt.label}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isSelected && isPackAvailable ? 'text-white/75' : 'text-[#7A8C7F]'}`}>
                          {opt.count === 1 ? 'Single unit' : `${opt.count} bottles`}
                        </div>
                      </div>

                      {/* Price Section (Faded when Out of Stock) */}
                      <div className={`mt-2 pt-1.5 border-t border-black/5 dark:border-white/10 transition-opacity duration-200 ${!isPackAvailable ? 'opacity-20' : ''}`}>
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className={`text-xs font-bold ${isSelected && isPackAvailable ? 'text-[#E5A953]' : 'text-[#183122]'}`}>
                            €{opt.price.toFixed(2)}
                          </span>
                          {opt.originalPrice && opt.originalPrice > opt.price && (
                            <span className={`text-[10px] line-through ${isSelected && isPackAvailable ? 'text-white/60' : 'text-[#9EAFA2]'}`}>
                              €{opt.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Centered Out of Stock Overlay in the Middle */}
                      {!isPackAvailable && (
                        <div className="absolute inset-0 rounded-2xl flex items-center justify-center p-1 bg-[#F4F0E8]/60 backdrop-blur-[0.5px] z-10 pointer-events-none">
                          <span className="px-2 py-0.5 bg-[#8B2525]/95 text-white text-[9px] font-bold tracking-wider rounded-md uppercase shadow-xs text-center leading-tight">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

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

            {/* Sensory & Flavor Profile */}
            {product.flavorProfile && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#14261B] uppercase tracking-wider flex items-center gap-1.5">
                    <Wine className="w-3.5 h-3.5 text-[#A67C37]" />
                    <span>{t.detail.sensoryProfile}</span>
                  </span>
                  <span className="text-[10px] text-[#7A8C7F] font-semibold tracking-wider uppercase">
                    5-Point Tasting Scale
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      label: t.detail.forestAromatics,
                      value: Number(product.flavorProfile.aromatics ?? 0),
                      max: 5,
                      icon: Compass,
                      iconColor: 'text-[#2E683E]',
                      iconBg: 'bg-[#EAF3ED]',
                      descriptor: getAromaticsDescriptor(Number(product.flavorProfile.aromatics ?? 0)),
                    },
                    {
                      label: t.detail.effervescence,
                      value: Number(product.flavorProfile.effervescence ?? 0),
                      max: 5,
                      icon: Sparkles,
                      iconColor: 'text-[#D49B4E]',
                      iconBg: 'bg-[#FFF9EE]',
                      descriptor: getEffervescenceDescriptor(Number(product.flavorProfile.effervescence ?? 0)),
                    },
                    {
                      label: t.detail.bitterness,
                      value: Number(product.flavorProfile.bitterness ?? 0),
                      max: 5,
                      icon: Wine,
                      iconColor: 'text-[#8B2525]',
                      iconBg: 'bg-[#FDF2F0]',
                      descriptor: getBitternessDescriptor(Number(product.flavorProfile.bitterness ?? 0)),
                    },
                    {
                      label: t.detail.sweetness,
                      value: Number(product.flavorProfile.sweetness ?? 0),
                      max: 5,
                      icon: Sun,
                      iconColor: 'text-[#B87A14]',
                      iconBg: 'bg-[#FAF5EA]',
                      descriptor: getSweetnessDescriptor(Number(product.flavorProfile.sweetness ?? 0)),
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-3 border border-[#E8E2D5] shadow-soft-sm flex flex-col justify-between hover:border-[#D6CEBF] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor} shadow-2xs`}>
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold text-[#14261B] bg-[#F5F2EB] px-2 py-0.5 rounded-full border border-[#EAE4D7]">
                          {item.value} / {item.max}
                        </span>
                      </div>

                      <div className="space-y-0.5 mb-2.5">
                        <div className="text-xs font-bold text-[#14261B] truncate">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-[#7A8C7F] font-medium truncate">
                          {item.descriptor}
                        </div>
                      </div>

                      {/* 5-step tactile pill segments */}
                      <div className="flex items-center gap-1 w-full pt-1">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              step <= item.value
                                ? 'bg-[#183324]'
                                : 'bg-[#EFECE3]'
                            }`}
                          />
                        ))}
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
                className={`flex-1 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98] ${isRestockNotified(product.id)
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
