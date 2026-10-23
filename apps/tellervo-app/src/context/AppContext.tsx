import React, { createContext, useContext, useState, useEffect } from 'react';
import { TabType, Product, CartItem, UserProfile, RewardItem, OrderItem, Language } from '../types';
import { PRODUCTS, INITIAL_USER, INITIAL_CART, RECENT_ORDERS } from '../data/mockData';
import { translations, Translations } from '../i18n/translations';
import confetti from 'canvas-confetti';

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
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  user: UserProfile;
  addSeeds: (amount: number, title: string) => void;
  redeemReward: (reward: RewardItem) => boolean;
  orders: OrderItem[];
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

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [products] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [favorites, setFavorites] = useState<string[]>([
    'spruce-needle-lime',
    'taiga-botanical-reserve',
    'cloudberry-golden-sparkler',
    'arctic-juniper-tonic',
    'wild-rowanberry-aperitif',
    'bilberry-forest-nectar',
  ]);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [orders] = useState<OrderItem[]>(RECENT_ORDERS);

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
    setFavorites(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from Forest Vault' : 'Saved to Forest Vault');
      return next;
    });
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
        favorites,
        toggleFavorite,
        user,
        addSeeds,
        redeemReward,
        orders,
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
