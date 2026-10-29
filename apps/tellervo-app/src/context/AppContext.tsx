import React, { createContext, useContext, useState, useEffect } from 'react';
import { TabType, Product, CartItem, UserProfile, RewardItem, OrderItem, Language } from '../types';
import { PRODUCTS, INITIAL_USER, RECENT_ORDERS } from '../data/mockData';
import { translations, Translations } from '../i18n/translations';
import confetti from 'canvas-confetti';
import { authService, profileService, AuthUser, AuthResult, supabase, productService, favouriteService } from '@tellervo/supabase';
import { mapRecordToProduct } from '../lib/productMapper';
import { ALL_ROUTES, APP_ROUTES } from '../routes/routes.config';
import { navigateTo } from '../routes/hooks/useNavigation';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'reward';
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (open: boolean) => void;
  t: Translations;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  products: Product[];
  isLoadingProducts: boolean;
  isFetchingMore: boolean;
  hasMoreProducts: boolean;
  productsError: string | null;
  isLiveProducts: boolean;
  refetchProducts: () => Promise<void>;
  fetchMoreProducts: () => Promise<void>;
  favorites: string[];
  isLoadingFavorites: boolean;
  toggleFavorite: (productId: string) => void;
  user: UserProfile;
  addSeeds: (amount: number, title: string) => void;
  redeemReward: (reward: RewardItem) => boolean;
  orders: OrderItem[];
  addOrder: (order: OrderItem) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isQuizOpen: boolean;
  setIsQuizOpen: (open: boolean) => void;
  isMembershipCardOpen: boolean;
  setIsMembershipCardOpen: (open: boolean) => void;
  isChatbotOpen: boolean;
  setIsChatbotOpen: (open: boolean) => void;
  selectedOrderForTracking: OrderItem | null;
  setSelectedOrderForTracking: (order: OrderItem | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'reward') => void;
  dismissToast: (id: string) => void;
  triggerConfetti: () => void;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  authUser: AuthUser | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  signup: (email: string, password: string, fullName: string, phone?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('tellervo_language');
      if (saved === 'en' || saved === 'fi' || saved === 'es') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('tellervo_language', lang);
    } catch {
      // ignore
    }
    const names = { en: 'English', fi: 'Suomi', es: 'Español' };
    showToast(`Language switched to ${names[lang]}`, 'info');
  };

  const t = translations[language] || translations.en;

  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const matched = ALL_ROUTES.find((r) => r.path === path);
    return matched?.tabEquivalent || 'home';
  });

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    const target = ALL_ROUTES.find((r) => r.tabEquivalent === tab);
    if (target && typeof window !== 'undefined') {
      const current = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      if (current !== target.path) {
        navigateTo(target.path);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const matched = ALL_ROUTES.find((r) => r.path === path);
      if (matched?.tabEquivalent) {
        setActiveTabState(matched.tabEquivalent);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const PAGE_SIZE = 20;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isLiveProducts, setIsLiveProducts] = useState<boolean>(false);

  // Initial fetch: 20 products from database
  const refetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      setProductsError(null);
      const { data, error } = await productService.fetchProducts({ limit: PAGE_SIZE, offset: 0 });

      if (error) {
        console.error('[AppContext] Error fetching database products:', error.message);
        setProductsError(error.message);
        setProducts([]);
        setHasMoreProducts(false);
        setIsLiveProducts(false);
        return;
      }

      const liveItems = (data || []).map(record => mapRecordToProduct(record));
      setProducts(liveItems);
      setIsLiveProducts(liveItems.length > 0);
      setHasMoreProducts(liveItems.length === PAGE_SIZE);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch products';
      console.error('[AppContext] Exception fetching products:', msg);
      setProductsError(msg);
      setProducts([]);
      setHasMoreProducts(false);
      setIsLiveProducts(false);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Infinite scroll: fetch next 20 products from database
  const fetchMoreProducts = async () => {
    if (!hasMoreProducts || isFetchingMore || isLoadingProducts) return;

    try {
      setIsFetchingMore(true);
      const currentOffset = products.length;
      const { data, error } = await productService.fetchProducts({
        limit: PAGE_SIZE,
        offset: currentOffset,
      });

      if (error) {
        console.error('[AppContext] Error fetching more products:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const nextItems = data.map(record => mapRecordToProduct(record));
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = nextItems.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
        setHasMoreProducts(nextItems.length === PAGE_SIZE);
      } else {
        setHasMoreProducts(false);
      }
    } catch (err: unknown) {
      console.error('[AppContext] Exception in fetchMoreProducts:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    refetchProducts();

    // Listen to real-time changes on products table in Supabase
    const channel = supabase
      .channel('tellervo-products-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: any) => {
          if (payload?.eventType === 'DELETE' && payload.old?.id) {
            const deletedId = payload.old.id;
            setFavorites(prev => prev.filter(id => id !== deletedId));
            setCart(prev => prev.filter(item => item.product.id !== deletedId));
          }
          refetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('tellervo_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item: { productId?: string; product?: { id: string }; quantity: number }) => {
              const pId = item.productId || item.product?.id;
              const foundProduct = PRODUCTS.find((p) => p.id === pId);
              if (foundProduct && item.quantity > 0) {
                return { product: foundProduct, quantity: item.quantity };
              }
              return null;
            })
            .filter(Boolean) as CartItem[];
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Automatically synchronize cart updates to browser storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const simplified = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      localStorage.setItem('tellervo_cart', JSON.stringify(simplified));
    } catch {
      // ignore
    }
  }, [cart]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tellervo_favorites');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('tellervo_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('tellervo_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const addOrder = (newOrder: OrderItem) => {
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('tellervo_orders', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  // Initialize and restore authenticated session on mount with Supabase
  useEffect(() => {
    if (!isLoadingSession && !authUser?.id) {
      setIsLoadingFavorites(false);
    }
  }, [isLoadingSession, authUser?.id]);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const session = await authService.getSession();
        if (isMounted) {
          if (session && session.user) {
            setAuthUser(session.user);
            setIsAuthenticated(true);
            setUser(prev => ({
              ...prev,
              name: session.user.name,
              handle: session.user.email.split('@')[0],
              tier: session.user.tier || prev.tier,
              seeds: session.user.seeds !== undefined ? session.user.seeds : prev.seeds,
              memberSince: session.user.memberSince || prev.memberSince,
              avatarUrl: session.user.avatarUrl || prev.avatarUrl,
              address: session.user.address || prev.address,
              paymentMethod: session.user.paymentMethod || prev.paymentMethod,
              dietaryPreferences: session.user.dietaryPreferences || prev.dietaryPreferences,
              role: session.user.role || prev.role || 'customer',
              status: session.user.status || prev.status || 'active',
            }));
          } else {
            setAuthUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch {
        if (isMounted) {
          setAuthUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    };

    restoreSession();

    // Listen to real-time Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setAuthUser(null);
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const authSession = await authService.getSession();
        if (isMounted && authSession?.user) {
          setAuthUser(authSession.user);
          setIsAuthenticated(true);
          setUser(prev => ({
            ...prev,
            name: authSession.user.name,
            handle: authSession.user.email.split('@')[0],
            tier: authSession.user.tier || prev.tier,
            seeds: authSession.user.seeds !== undefined ? authSession.user.seeds : prev.seeds,
            memberSince: authSession.user.memberSince || prev.memberSince,
            avatarUrl: authSession.user.avatarUrl || prev.avatarUrl,
            address: authSession.user.address || prev.address,
            paymentMethod: authSession.user.paymentMethod || prev.paymentMethod,
            dietaryPreferences: authSession.user.dietaryPreferences || prev.dietaryPreferences,
            role: authSession.user.role || prev.role || 'customer',
            status: authSession.user.status || prev.status || 'active',
          }));
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load and sync user favorites from Supabase favourite table
  useEffect(() => {
    if (!authUser?.id) return;
    let isCancelled = false;

    const loadDbFavorites = async () => {
      setIsLoadingFavorites(true);
      try {
        const { data, error } = await favouriteService.getFavoriteIds(authUser.id);
        if (!isCancelled && !error && Array.isArray(data)) {
          // The database is the authoritative source of truth
          setFavorites(data);
        }
      } catch (err) {
        console.error('[AppContext] Error loading user favorites:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingFavorites(false);
        }
      }
    };

    loadDbFavorites();

    const channel = supabase
      .channel(`user-favourites-${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favourite',
          filter: `user_id=eq.${authUser.id}`,
        },
        (payload: any) => {
          if (payload?.eventType === 'DELETE') {
            setFavorites([]);
            return;
          }
          const newRow = payload?.new as { order_ids?: string[] } | undefined;
          if (newRow && Array.isArray(newRow.order_ids)) {
            setFavorites(newRow.order_ids);
          }
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [authUser?.id]);

  // Ensure all favorited items are populated in the products list
  useEffect(() => {
    if (!favorites.length) return;
    const missingIds = favorites.filter(id => !products.some(p => p.id === id));
    if (!missingIds.length) return;

    let isMounted = true;
    const fetchMissing = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', missingIds);

        if (!error && data && data.length && isMounted) {
          const mapped = data.map(mapRecordToProduct);
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProds = mapped.filter(m => !existingIds.has(m.id));
            return [...prev, ...newProds];
          });
        }
      } catch {
        // ignore
      }
    };

    fetchMissing();
    return () => {
      isMounted = false;
    };
  }, [favorites, products]);

  const login = async (email: string, password: string, rememberMe = false): Promise<AuthResult> => {
    const result = await authService.signIn(email, password, rememberMe);
    if (result.success && result.user) {
      setAuthUser(result.user);
      setIsAuthenticated(true);
      setUser(prev => ({
        ...prev,
        name: result.user!.name,
        handle: result.user!.email.split('@')[0],
        tier: result.user!.tier || prev.tier,
        seeds: result.user!.seeds !== undefined ? result.user!.seeds : prev.seeds,
        memberSince: result.user!.memberSince || prev.memberSince,
        avatarUrl: result.user!.avatarUrl || prev.avatarUrl,
        address: result.user!.address || prev.address,
        paymentMethod: result.user!.paymentMethod || prev.paymentMethod,
        dietaryPreferences: result.user!.dietaryPreferences || prev.dietaryPreferences,
        role: result.user!.role || prev.role || 'customer',
        status: result.user!.status || prev.status || 'active',
      }));
    }
    return result;
  };

  const signup = async (email: string, password: string, fullName: string, phone?: string): Promise<AuthResult> => {
    const result = await authService.signUp(email, password, fullName, phone);
    if (result.success && result.user && !result.confirmationRequired) {
      setAuthUser(result.user);
      setIsAuthenticated(true);
      setUser(prev => ({
        ...prev,
        name: result.user!.name,
        handle: result.user!.email.split('@')[0],
        tier: result.user!.tier || 'Taiga Patron',
        seeds: result.user!.seeds !== undefined ? result.user!.seeds : 50,
        memberSince: result.user!.memberSince || prev.memberSince,
        avatarUrl: result.user!.avatarUrl || prev.avatarUrl,
        address: result.user!.address || prev.address,
        paymentMethod: result.user!.paymentMethod || prev.paymentMethod,
        dietaryPreferences: result.user!.dietaryPreferences || prev.dietaryPreferences,
        role: result.user!.role || 'customer',
      }));
      triggerConfetti();
    }
    return result;
  };

  const logout = async (): Promise<void> => {
    await authService.signOut();
    setAuthUser(null);
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    setFavorites([]);
    try {
      localStorage.removeItem('tellervo_favorites');
    } catch {
      // ignore
    }
    setActiveTab('home');
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    setUser(prev => ({ ...prev, ...updates }));
    if (authUser?.id) {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.full_name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.dietaryPreferences !== undefined) dbUpdates.dietary_preferences = updates.dietaryPreferences;
      if (updates.tier !== undefined) dbUpdates.tier = updates.tier;
      if (updates.seeds !== undefined) dbUpdates.seeds = updates.seeds;

      await profileService.updateProfile(authUser.id, dbUpdates);
    }
  };

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isMembershipCardOpen, setIsMembershipCardOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<OrderItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Toast feedback
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'reward' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Real-time listener for customer account status changes (e.g. administrator deactivation)
  useEffect(() => {
    if (!authUser?.id) return;
    let isCancelled = false;

    const profileChannel = supabase
      .channel(`user-profile-status-${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${authUser.id}`,
        },
        async (payload: any) => {
          if (isCancelled) return;
          const updatedStatus = payload?.new?.status;
          if (updatedStatus === 'deactive') {
            await logout();
            showToast('Your account has been deactivated. Please contact Help & Support for assistance.', 'info');
            navigateTo(APP_ROUTES.LOGIN.path);
          } else if (updatedStatus === 'active') {
            setUser(prev => ({ ...prev, status: 'active' }));
            setAuthUser(prev => (prev ? { ...prev, status: 'active' } : prev));
          }
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(profileChannel);
    };
  }, [authUser?.id]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#2A4A35', '#E5A953', '#D3E7D9', '#E87D3E'],
      });
    } catch {
      // ignore
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.name} to Forest Box`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Removed from Forest Box', 'info');
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (productId: string) => {
    const exists = favorites.includes(productId);
    const updated = exists
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];

    setFavorites(updated);
    showToast(exists ? 'Removed from Forest Vault' : 'Saved to Forest Vault');

    if (authUser?.id) {
      favouriteService.setFavoriteIds(authUser.id, updated).catch(err => {
        console.warn('[AppContext] Could not persist favorite to Supabase:', err);
      });
    }
  };

  const addSeeds = (amount: number, title: string) => {
    setUser(prev => ({
      ...prev,
      seeds: prev.seeds + amount,
    }));
    triggerConfetti();
    showToast(`+${amount} Seeds earned for ${title}!`, 'reward');
  };

  const redeemReward = (reward: RewardItem): boolean => {
    if (user.seeds < reward.seedsCost) {
      showToast(`Need ${reward.seedsCost - user.seeds} more seeds to redeem this reward.`, 'info');
      return false;
    }
    setUser(prev => ({
      ...prev,
      seeds: prev.seeds - reward.seedsCost,
    }));
    triggerConfetti();
    showToast(`Redeemed ${reward.title}! Check your vouchers.`, 'reward');
    return true;
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        t,
        activeTab,
        setActiveTab,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        products,
        isLoadingProducts,
        isFetchingMore,
        hasMoreProducts,
        productsError,
        isLiveProducts,
        refetchProducts,
        fetchMoreProducts,
        favorites,
        isLoadingFavorites,
        toggleFavorite,
        user,
        addSeeds,
        redeemReward,
        orders,
        addOrder,
        isCartOpen,
        setIsCartOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isQuizOpen,
        setIsQuizOpen,
        isMembershipCardOpen,
        setIsMembershipCardOpen,
        isChatbotOpen,
        setIsChatbotOpen,
        selectedOrderForTracking,
        setSelectedOrderForTracking,
        selectedProduct,
        setSelectedProduct,
        toasts,
        showToast,
        dismissToast,
        triggerConfetti,
        isAuthenticated,
        isLoadingSession,
        authUser,
        login,
        signup,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
