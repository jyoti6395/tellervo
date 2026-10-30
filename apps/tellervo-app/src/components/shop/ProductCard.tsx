import React, { useState } from 'react';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

const getBadgeStyleClass = (type?: string) => {
  switch (type) {
    case 'bestseller':
      return 'bg-[#FFF9EE] text-[#8C5D14] border-[#F5DCB1]';
    case 'seasonal':
    case 'organic':
      return 'bg-[#F0F5F1] text-[#1E4A2F] border-[#CFE0D4]';
    case 'adaptogenic':
      return 'bg-[#F5F0F8] text-[#5B2E8A] border-[#DECDEB]';
    case 'new-harvest':
      return 'bg-[#FAF5EA] text-[#8A6318] border-[#E8D9BD]';
    case 'zero-proof':
      return 'bg-[#F0F7FA] text-[#1F5472] border-[#CDE3EE]';
    case 'exclusive':
      return 'bg-[#FDF6ED] text-[#8D4A18] border-[#F5D8C0]';
    default:
      return 'bg-[#F0F5F1] text-[#1E4A2F] border-[#CFE0D4]';
  }
};

const getStatusBadgeStyle = (status?: string) => {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('out of stock') || s.includes('outofstock')) {
    return 'bg-[#8B2525]/95 text-white';
  }
  if (s.includes('low stock') || s.includes('limited')) {
    return 'bg-[#C97B1A]/95 text-white';
  }
  if (s.includes('active')) {
    return 'bg-[#183324]/90 text-white';
  }
  return 'bg-[#183324]/90 text-white';
};

const formatStatusText = (status: string) => {
  const s = status.toLowerCase().trim();
  if (s.includes('low stock') || s.includes('lowstock') || s.includes('limited')) {
    return 'Limited Stock';
  }
  return status;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
}) => {
  const { favorites, toggleFavorite, addToCart } = useApp();
  const isFav = favorites.includes(product.id);
  const [isPumping, setIsPumping] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPumping(false);
    requestAnimationFrame(() => {
      setIsPumping(true);
    });
    toggleFavorite(product.id);
  };

  // Status checks: Active, Low Stock ("Low Stock"), Out of Stock
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
      product.stockStatus === 'low-stock');

  // Custom Badge (only displayed if badge is set)
  const badgeText = (product.badge || '').trim();

  return (
    <div
      className={`flex flex-col justify-between group transition-all ${
        isOutOfStock ? 'opacity-90' : ''
      }`}
    >
      {/* Image & Badges */}
      <div
        onClick={() => onProductClick(product)}
        className="relative rounded-2xl overflow-hidden aspect-square mb-2.5 bg-[#F6F3EB] cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80';
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale-[30%]' : ''
            }`}
        />

        {/* Top-Left Image Badge: Status directly from Supabase (hidden when status is Active, formatted as Limited Stock) */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none flex flex-col gap-1">
          {product.status && product.status.toLowerCase().trim() !== 'active' ? (
            <span
              className={`px-2 py-0.5 backdrop-blur-sm text-[9px] font-bold tracking-wider rounded-md uppercase shadow-xs ${getStatusBadgeStyle(
                product.status
              )}`}
            >
              {formatStatusText(product.status)}
            </span>
          ) : null}
        </div>

        {/* Favorite Heart Button (No White BG, Smooth Zoom-up Pop Effect) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          onAnimationEnd={() => setIsPumping(false)}
          aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
          className="absolute top-2.5 right-2.5 z-10 p-1 flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-90 select-none focus:outline-none"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-200 ${
              isPumping ? 'animate-heart-pop' : ''
            } ${
              isFav
                ? 'fill-[#C53D43] text-[#C53D43] drop-shadow-[0_2px_6px_rgba(197,61,67,0.45)]'
                : 'text-white/95 fill-black/15 stroke-[2] drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.55)] hover:text-white hover:scale-105'
            }`}
          />
        </button>
      </div>

      {/* Subtitle / Category Notes */}
      <div
        onClick={() => onProductClick(product)}
        className="flex-1 cursor-pointer"
      >
        <div className="text-[9px] font-bold tracking-wider text-[#988151] uppercase mb-0.5 truncate">
          {product.category || product.notes}
        </div>

        <h3 className="font-editorial text-sm font-semibold text-[#14261B] leading-tight line-clamp-2 hover:text-[#285737] transition-colors">
          {product.name}
        </h3>

        {/* Size / Volume and Small Badge */}
        <div className="flex items-center justify-between gap-1.5 mt-1 min-h-[20px]">
          <span className="text-[11px] text-[#7C8D80] truncate font-medium shrink-0">
            {product.size}
          </span>

          {badgeText && (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border shadow-2xs shrink-0 max-w-[65%] truncate ${getBadgeStyleClass(
                product.badgeType
              )}`}
            >
              <Sparkles className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{badgeText}</span>
            </span>
          )}
        </div>
      </div>

      {/* Price & Add / Purchase Button */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#F0EBE0] min-h-[36px]">
        <div
          onClick={() => onProductClick(product)}
          className="flex items-baseline gap-1.5 cursor-pointer"
        >
          <span className="font-editorial text-sm font-bold text-[#14261B]">
            €{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-[#9EAFA2] line-through">
              €{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Button / Out of Stock Badge */}
        {isOutOfStock ? (
          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#FBF0F0] text-[#932323] border border-[#F5CACA] shadow-2xs whitespace-nowrap">
            Out of Stock
          </span>
        ) : (
          <button
            type="button"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            className="w-8 h-8 rounded-full bg-[#183324] text-[#FAF8F3] flex items-center justify-center hover:bg-[#284B36] active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
