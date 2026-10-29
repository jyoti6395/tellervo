export type TabType = 'home' | 'shop' | 'rewards' | 'favorites' | 'profile';
export type Language = 'en' | 'fi' | 'es';

export interface Product {
  id: string;
  name: string;
  category: string;
  badge?: string;
  badgeType?: 'bestseller' | 'seasonal' | 'organic' | 'adaptogenic' | 'new-harvest' | 'zero-proof' | 'exclusive' | 'database';
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  images?: string[];
  isFeatured?: boolean;
  isMostSelling?: boolean;
  size: string;
  rating?: number;
  reviewsCount?: number;
  notes?: string;
  description: string;
  imageUrl: string;
  gallery?: string[];
  isSaved?: boolean;
  status?: 'Active' | 'Low Stock' | 'Out of Stock' | 'Draft' | 'Archived' | string;
  stockStatus?: 'in-stock' | 'low-stock' | 'just-restocked' | 'out-of-stock';
  stockCount?: number;
  lastOrderedText?: string;
  autoRefillOptions?: string[];
  currentAutoRefill?: string;
  stockNotify?: boolean;
  harvestLocation?: string;
  flavorProfile?: {
    bitterness: number;
    sweetness: number;
    aromatics: number;
    effervescence: number;
  };
  ingredients?: string[];
  nutrition?: {
    calories: string;
    sugar: string;
    abv: string;
    volume: string;
  };
  servingRitual?: string;
  packOptions?: {
    label: string;
    count: number;
    price: number;
    savings?: string;
  }[];
  reviews?: {
    author: string;
    location: string;
    rating: number;
    text: string;
    date: string;
  }[];
  isFromDatabase?: boolean;
  sku?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface RewardItem {
  id: string;
  title: string;
  seedsCost: number;
  description: string;
  imageUrl: string;
  category: string;
}

export interface SeedActivity {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  iconType: 'cart' | 'referral' | 'voucher' | 'streak';
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  statusType: 'in-transit' | 'delivered';
  courier: string;
  summary: string;
  items: {
    name: string;
    qty: number;
    price: number;
    status?: string;
    imageUrl?: string;
    category?: string;
    size?: string;
  }[];
  trackingId?: string;
  recipientName?: string;
  address?: string;
  paymentMethod?: string;
  instructions?: string;
  dispatchOrigin?: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  memberSince: string;
  tier: string;
  seeds: number;
  level: number;
  totalLevels: number;
  nextTier: string;
  seedsNeeded: number;
  treesPlanted: number;
  avatarUrl: string;
  address: string;
  phone?: string;
  paymentMethod: string;
  dietaryPreferences: string;
  role?: string;
  status?: 'active' | 'deactive';
  subscription: {
    title: string;
    status: string;
    cycleText: string;
    price: number;
    nextDispatchDate: string;
    curatedItems: string;
    canCount: number;
  };
  notifications: {
    seasonalDrops: boolean;
    restockAlerts: boolean;
    orderUpdates: boolean;
  };
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  tags: string[];
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
}
