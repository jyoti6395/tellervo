import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
}) => {
  const { favorites, toggleFavorite, addToCart } = useApp();
  const isFav = favorites.includes(product.id);

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
      product.stockStatus === 'low-stock' ||
      (product.stockCount !== undefined && product.stockCount > 0 && product.stockCount <= 5));

  return (
    <div className={`bg-white rounded-3xl p-3 sm:p-4 border border-[#EAE4D7] shadow-soft-sm flex flex-col justify-between group hover:border-[#D6CEBF] transition-all hover:shadow-md ${
      isOutOfStock ? 'opacity-90' : ''
    }`}>
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
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? 'grayscale-[30%]' : ''
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
          ) : (product.badge || product.isMostSelling) ? (
            <span className="px-2 py-0.5 bg-[#183324]/90 backdrop-blur-sm text-[#FAF8F3] text-[9px] font-bold tracking-wider rounded-md uppercase shadow-xs">
              {product.badge || 'BESTSELLER'}
            </span>
          ) : null}
        </div>

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
        onClick={() => onProductClick(product)}
        className="flex-1 cursor-pointer"
      >
        <div className="text-[9px] font-bold tracking-wider text-[#988151] uppercase mb-0.5 truncate">
          {product.category || product.notes}
        </div>

        <h3 className="font-editorial text-sm font-semibold text-[#14261B] leading-tight line-clamp-2 hover:text-[#285737] transition-colors">
          {product.name}
        </h3>

        <p className="text-[11px] text-[#7C8D80] mt-0.5">{product.size}</p>
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

        {/* Action Button: Hidden when out of stock (only shows badge on image) */}
        {!isOutOfStock && (
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
