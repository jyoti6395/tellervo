import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { productService, ProductFilters } from '@tellervo/supabase';
import { mapRecordToProduct } from '../lib/productMapper';
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
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Database search state
  const [dbSearchResults, setDbSearchResults] = useState<Product[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [hasMoreDbResults, setHasMoreDbResults] = useState(false);
  const [isFetchingMoreDb, setIsFetchingMoreDb] = useState(false);
  const [dbAllCategories, setDbAllCategories] = useState<string[]>([]);

  // Fetch all distinct categories directly from database on mount
  useEffect(() => {
    productService.fetchDistinctFilterOptions().then(({ categories: cats }: { categories: string[]; volumes: string[] }) => {
      if (cats && cats.length > 0) {
        setDbAllCategories(cats);
      }
    });
  }, []);

  // Dynamic Categories merging database categories with current product list
  const categories = useMemo(() => {
    const set = new Set<string>();
    dbAllCategories.forEach((c) => set.add(c.trim()));
    products.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    const uniqueCats = Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
    return [
      { id: 'all', label: t.shop?.allDrinks || 'All Drinks' },
      ...uniqueCats.map((cat) => ({ id: cat, label: cat })),
    ];
  }, [dbAllCategories, products, t.shop]);

  const isFilterActive =
    searchQuery.trim().length > 0 ||
    activeCategory !== 'all' ||
    selectedTags.length > 0 ||
    priceFilter !== 'all';

  // Matcher for any product against active filters
  const matchesFilter = useCallback((product: Product): boolean => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.notes && product.notes.toLowerCase().includes(q)) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.size && product.size.toLowerCase().includes(q));
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
      const matchVessel = selectedTags.some(
        (tag) => (product.size || '').trim().toLowerCase() === tag.trim().toLowerCase()
      );
      if (!matchVessel) return false;
    }

    if (priceFilter !== 'all') {
      const effectivePrice = product.price || 0;
      if (priceFilter === 'under-100' && !(effectivePrice < 100)) return false;
      if (priceFilter === '100-500' && !(effectivePrice >= 100 && effectivePrice <= 500)) return false;
      if (priceFilter === 'under-500' && !(effectivePrice < 500)) return false;
      if (priceFilter === 'above-500' && !(effectivePrice > 500)) return false;
    }

    return true;
  }, [searchQuery, activeCategory, selectedTags, priceFilter]);

  // Query database whenever any filter changes
  useEffect(() => {
    if (!isFilterActive) {
      setDbSearchResults([]);
      setIsSearchingDb(false);
      setHasMoreDbResults(false);
      return;
    }

    let isCancelled = false;
    setIsSearchingDb(true);

    const timer = setTimeout(async () => {
      try {
        const filters: ProductFilters = {
          category: activeCategory !== 'all' ? activeCategory : undefined,
          volume: selectedTags.length > 0 ? selectedTags : undefined,
          search: searchQuery.trim() || undefined,
          priceRange: priceFilter as any,
          limit: 20,
          offset: 0,
        };

        const { data, error } = await productService.fetchProducts(filters);
        if (isCancelled) return;

        if (!error && data) {
          const mapped = data.map(mapRecordToProduct).filter(matchesFilter);
          setDbSearchResults(mapped);
          setHasMoreDbResults(data.length === 20);
        } else {
          setDbSearchResults([]);
          setHasMoreDbResults(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('[ShopScreen] DB filter search error:', err);
          setDbSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearchingDb(false);
        }
      }
    }, searchQuery.trim() ? 250 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isFilterActive, searchQuery, activeCategory, selectedTags, priceFilter, matchesFilter]);

  // Load next 20 items from database for active filter
  const fetchMoreFilteredProducts = async () => {
    if (isFetchingMoreDb || !hasMoreDbResults) return;
    setIsFetchingMoreDb(true);
    try {
      const filters: ProductFilters = {
        category: activeCategory !== 'all' ? activeCategory : undefined,
        volume: selectedTags.length > 0 ? selectedTags : undefined,
        search: searchQuery.trim() || undefined,
        priceRange: priceFilter as any,
        limit: 20,
        offset: dbSearchResults.length,
      };

      const { data, error } = await productService.fetchProducts(filters);
      if (!error && data && data.length > 0) {
        const mapped = data.map(mapRecordToProduct).filter(matchesFilter);
        setDbSearchResults((prev) => [...prev, ...mapped]);
        setHasMoreDbResults(data.length === 20);
      } else {
        setHasMoreDbResults(false);
      }
    } catch (err) {
      console.error('[ShopScreen] Error fetching more filtered items:', err);
      setHasMoreDbResults(false);
    } finally {
      setIsFetchingMoreDb(false);
    }
  };


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
          if (isFilterActive) {
            fetchMoreFilteredProducts();
          } else {
            fetchMoreProducts();
          }
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
  }, [hasMoreProducts, isFetchingMore, isLoadingProducts, fetchMoreProducts, isFilterActive, hasMoreDbResults, isFetchingMoreDb, dbSearchResults.length]);

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
    setPriceFilter('all');
    setSelectedTags([]);
    setSearchQuery('');
  };

  // Combine products: Shown matching products FIRST, then searched data from DB
  const filteredProducts = useMemo(() => {
    if (!isFilterActive) {
      return products;
    }

    // 1. Immediately show currently loaded products that match the filter
    const shownMatching = products.filter(matchesFilter);
    const combined: Product[] = [...shownMatching];
    const seenIds = new Set(shownMatching.map((p) => p.id));

    // 2. Append searched data from the database
    for (const item of dbSearchResults) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        combined.push(item);
      }
    }

    return combined;
  }, [isFilterActive, products, dbSearchResults, matchesFilter]);

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
    (activeCategory !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    selectedTags.length;

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
        priceFilter={priceFilter}
        onClearPrice={() => setPriceFilter('all')}
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

      {/* Database Searching Indicator */}
      {isSearchingDb && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50/70 border border-emerald-100/80 rounded-2xl text-xs font-medium text-[#183324] animate-in fade-in duration-150">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E7D32]" />
          <span>Searching database for matching botanical infusions...</span>
        </div>
      )}

      {/* 6. Empty State */}
      {sortedProducts.length === 0 && !isLoadingProducts && !isSearchingDb && (
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
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        products={products}
      />
    </div>
  );
};
