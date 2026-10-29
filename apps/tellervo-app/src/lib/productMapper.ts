import { Product } from '../types';
import { ProductRecord } from './supabase';

/**
 * Transforms a Supabase ProductRecord into the customer-facing Product interface.
 * Strictly maps database fields (original_price, discount_price, images array, badge,
 * badge_type, is_featured, is_most_selling, flavor_profile) without injecting hardcoded mock data.
 */
export function mapRecordToProduct(record: ProductRecord): Product {
  // Badges & Badge types (strictly from database fields)
  let badge: string | undefined = record.badge?.trim() || undefined;
  let badgeType: Product['badgeType'] = (record.badge_type?.trim() as Product['badgeType']) || undefined;

  if (!badge && (record.is_most_selling || (record as any).most_selling)) {
    badge = 'BESTSELLER';
    badgeType = 'bestseller';
  }

  // Stock status
  let stockStatus: Product['stockStatus'] = 'in-stock';
  const rawStatus = (record.status || '').toLowerCase().trim();
  const normalizedStatus = rawStatus.replace(/[\s_-]+/g, '');
  const stockCount = Number(record.stock) || 0;

  if (
    normalizedStatus === 'outofstock' ||
    rawStatus === 'out of stock' ||
    rawStatus === 'out_of_stock' ||
    rawStatus === 'out-of-stock' ||
    stockCount === 0
  ) {
    stockStatus = 'out-of-stock';
  } else if (
    normalizedStatus === 'lowstock' ||
    rawStatus === 'low stock' ||
    rawStatus === 'low_stock' ||
    rawStatus === 'low-stock' ||
    (stockCount > 0 && stockCount <= 5)
  ) {
    stockStatus = 'low-stock';
  }

  const volume = record.volume || '';

  // Pricing: original_price and discount_price
  const origPrice = Number(record.original_price ?? record.price ?? 0);
  const discPrice =
    record.discount_price != null && Number(record.discount_price) > 0
      ? Number(record.discount_price)
      : undefined;

  // Active price customer pays
  const activePrice = discPrice !== undefined ? discPrice : origPrice;
  // If on discount, show original as strikethrough price
  const strikethroughPrice =
    discPrice !== undefined && discPrice < origPrice ? origPrice : undefined;

  const description = record.description || '';

  // Images: multiple images array with legacy fallback
  const imagesList =
    Array.isArray(record.images) && record.images.length > 0
      ? record.images.filter(Boolean)
      : record.image_url
        ? [record.image_url]
        : [];

  const primaryImage = imagesList[0] || '';

  // Flavor Profile: only present if defined in record
  const flavor = record.flavor_profile;
  const flavorProfile =
    flavor && (flavor.bitterness !== undefined || flavor.sweetness !== undefined || flavor.aromatics !== undefined || flavor.effervescence !== undefined)
      ? {
          bitterness: Number(flavor.bitterness ?? 0),
          sweetness: Number(flavor.sweetness ?? 0),
          aromatics: Number(flavor.aromatics ?? 0),
          effervescence: Number(flavor.effervescence ?? 0),
        }
      : undefined;

  return {
    id: record.id,
    name: record.name,
    category: record.category ? record.category.trim() : '',
    badge,
    badgeType,
    price: activePrice,
    originalPrice: strikethroughPrice,
    discountPrice: discPrice,
    size: volume,
    rating: (record as any).rating || undefined,
    reviewsCount: (record as any).reviews_count || undefined,
    notes: (record as any).notes || undefined,
    description,
    imageUrl: primaryImage,
    gallery: imagesList.length > 0 ? imagesList : undefined,
    images: imagesList,
    isFeatured: Boolean(record.is_featured),
    isMostSelling: Boolean(record.is_most_selling ?? (record as any).most_selling),
    status:
      record.status ||
      (stockStatus === 'out-of-stock'
        ? 'Out of Stock'
        : stockStatus === 'low-stock'
          ? 'Low Stock'
          : 'Active'),
    stockStatus,
    stockCount,
    isFromDatabase: true,
    sku: record.sku || undefined,
    harvestLocation: (record as any).harvest_location || (record as any).harvestLocation || undefined,
    nutrition: (record as any).nutrition || undefined,
    flavorProfile,
    ingredients: (record as any).ingredients || undefined,
    servingRitual: (record as any).serving_ritual || (record as any).servingRitual || undefined,
    packOptions: (record as any).pack_options || (record as any).packOptions || undefined,
  };
}
