import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { FilterDrawer } from '../components/FilterDrawer';
import { useNavigation } from '../routes/hooks/useNavigation';
import { Product } from '../types';
import { ShopSearchBar } from '../components/shop/ShopSearchBar';
import { ShopActiveFilters } from '../components/shop/ShopActiveFilters';
import { ShopSortHeader, SortOption } from '../components/shop/ShopSortHeader';
import { ProductCard } from '../components/shop/ProductCard';
import { ShopCartBar } from '../components/shop/ShopCartBar';
import { ShopEmptyState } from '../components/shop/ShopEmptyState';

/**
 * Botanical Shop & Cellar Drops Screen
 * Composed of clean, single-responsibility subcomponents for readability and maintenance.
 */
export const ShopScreen: React.FC = () => {
  const {
    products,
    setSelectedProduct,
    showToast,
    t,
    isLoadingProducts,
    isFetchingMore,
    hasMoreProducts,
    refetchProducts,
    fetchMoreProducts,
    productsError,
  } = useApp();

  const { navigate } = useNavigation();

  // Filter & Search State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Dynamic Categories from database products
  const categories = useMemo(() => {
    const uniqueCats = Array.from(
      new Set(
        products
          .map((p) => (p.category || '').trim())
          .filter(Boolean)
      )
    );
    return [
      { id: 'all', label: t.shop?.allDrinks || 'All Drinks' },
      ...uniqueCats.map((cat) => ({ id: cat, label: cat })),
    ];
  }, [products, t.shop]);

  // Infinite Scroll Sentinel Observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (!hasMoreProducts || isFetchingMore || isLoadingProducts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          fetchMoreProducts();
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreProducts, isFetchingMore, isLoadingProducts, fetchMoreProducts]);

  const handleVoiceSearch = () => {
    setIsListening(true);
    showToast('Listening for botanical infusions...', 'info');
    setTimeout(() => {
      setIsListening(false);
      setSearchQuery('Coconut');
      showToast('Found "Coconut" infusions', 'success');
    }, 1500);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/shop/${product.id}`);
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSelectedTags([]);
    setSearchQuery('');
  };

  // Filter products by search text, category, and packaging tags
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          (product.notes && product.notes.toLowerCase().includes(q)) ||
          (product.description && product.description.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (activeCategory !== 'all') {
        if (
          (product.category || '').trim().toLowerCase() !==
          activeCategory.trim().toLowerCase()
        ) {
          return false;
        }
      }

      if (selectedTags.length > 0) {
        const matchVessel = selectedTags.some((tag) => {
          return (
            (product.size || '').trim().toLowerCase() === tag.trim().toLowerCase()
          );
        });
        if (!matchVessel) return false;
      }

      return true;
    });
  }, [products, searchQuery, activeCategory, selectedTags]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const activeFilterCount =
    (activeCategory !== 'all' ? 1 : 0) + selectedTags.length;

  return (
    <div className="pb-32 px-4 pt-3 w-full space-y-4 animate-in fade-in duration-200 relative">
      {/* 1. Error Banner */}
      {productsError && (
        <div className="bg-[#FFF4E5] rounded-2xl p-2.5 px-3 border border-[#FFE0B2] flex items-center justify-between text-xs text-[#7A4100]">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-[#E65100] shrink-0" />
            <span className="truncate">
              Could not sync products from database: {productsError}
            </span>
          </div>
          <button
            onClick={() => refetchProducts()}
            className="text-[11px] font-bold underline shrink-0 hover:text-black ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <ShopSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isListening={isListening}
        onVoiceSearch={handleVoiceSearch}
        onOpenFilter={() => setIsFilterOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* 3. Active Filter Chips with Quick Dismiss */}
      <ShopActiveFilters
        activeCategory={activeCategory}
        categoryLabel={categories.find((c) => c.id === activeCategory)?.label}
        onClearCategory={() => setActiveCategory('all')}
        selectedTags={selectedTags}
        onRemoveTag={(tag) =>
          setSelectedTags((prev) => prev.filter((t) => t !== tag))
        }
        onOpenFilter={() => setIsFilterOpen(true)}
        onClearAll={handleResetFilters}
      />

      {/* 4. Products Count & Sort Selector */}
      <ShopSortHeader
        totalCount={sortedProducts.length}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isOpen={isSortDropdownOpen}
        setIsOpen={setIsSortDropdownOpen}
      />

      {/* 5. Shimmer Loading Skeleton */}
      {isLoadingProducts && products.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-3 border border-[#EAE4D7] space-y-2.5"
            >
              <div className="aspect-square bg-[#EFEAE0] rounded-2xl" />
              <div className="h-3 bg-[#EFEAE0] rounded-md w-3/4" />
              <div className="h-2.5 bg-[#EFEAE0] rounded-md w-1/2" />
              <div className="h-4 bg-[#EFEAE0] rounded-md w-1/3 pt-1" />
            </div>
          ))}
        </div>
      )}

      {/* 6. Empty State */}
      {sortedProducts.length === 0 && !isLoadingProducts && (
        <ShopEmptyState onReset={handleResetFilters} />
      )}

      {/* 7. Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={handleProductClick}
          />
        ))}
      </div>

      {/* 8. Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />

      {/* 9. Infinite Scroll Loading Spinner */}
      {isFetchingMore && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-[#183324] animate-in fade-in duration-200">
          <RotateCcw className="w-4 h-4 animate-spin text-[#2E7D32]" />
          <span>Fetching next 20 botanical drinks...</span>
        </div>
      )}

      {/* 10. Floating Bag Bar */}
      <ShopCartBar />

      {/* 11. Portaled Slide-over Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        products={products}
      />
    </div>
  );
};
