import { Product } from '../types';
import { ProductRecord } from './supabase';

/**
 * Transforms a Supabase ProductRecord into the rich customer-facing Product interface.
 * Provides sensible defaults for botanical attributes, pricing packs, and images.
 */
export function mapRecordToProduct(record: ProductRecord): Product {
  const catLower = (record.category || '').toLowerCase();
  const nameLower = (record.name || '').toLowerCase();

  // Badges & Badge types
  let badge: string | undefined = undefined;
  let badgeType: Product['badgeType'] = undefined;

  if (catLower.includes('organic') || nameLower.includes('organic')) {
    badge = 'ORGANIC';
    badgeType = 'organic';
  } else if (catLower.includes('adaptogen')) {
    badge = 'ADAPTOGENIC';
    badgeType = 'adaptogenic';
  } else if (catLower.includes('zero-proof') || catLower.includes('spirit')) {
    badge = '0.0% ABV';
    badgeType = 'zero-proof';
  } else if (catLower.includes('spritz') || catLower.includes('berry')) {
    badge = 'SEASONAL';
    badgeType = 'seasonal';
  } else if (catLower.includes('tonic')) {
    badge = 'BESTSELLER';
    badgeType = 'bestseller';
  } else {
    badge = 'DATABASE';
    badgeType = 'database';
  }

  // Stock status
  let stockStatus: Product['stockStatus'] = 'in-stock';
  const rawStatus = (record.status || '').toLowerCase();
  const stockCount = Number(record.stock) || 0;

  if (rawStatus === 'out of stock' || rawStatus === 'out_of_stock' || stockCount === 0) {
    stockStatus = 'out-of-stock';
  } else if (rawStatus === 'low stock' || rawStatus === 'low_stock' || (stockCount > 0 && stockCount <= 5)) {
    stockStatus = 'low-stock';
  }

  const volume = record.volume || '330 ml';
  const price = Number(record.price) || 0;
  const description = record.description || 'Pure cold-crafted Nordic botanical drink, brewed with sustainably harvested ingredients.';

  return {
    id: record.id,
    name: record.name,
    category: record.category ? record.category.trim() : 'Botanical Blend',
    badge,
    badgeType,
    price,
    size: volume,
    rating: 4.9,
    reviewsCount: 16,
    notes: description.length > 50 ? `${description.slice(0, 48)}...` : description,
    description,
    imageUrl: record.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    stockStatus,
    stockCount,
    isFromDatabase: true,
    sku: record.sku || undefined,
    harvestLocation: 'Lapland Taiga, Finland',
    nutrition: {
      calories: '18 kcal / 100ml',
      sugar: '0g refined sugar',
      abv: '0.0%',
      volume,
    },
    flavorProfile: {
      bitterness: 2,
      sweetness: 3,
      aromatics: 4,
      effervescence: 4,
    },
    ingredients: [
      'Pure Cold-Pressed Botanical Extract',
      'Nordic Glacial Spring Water',
      'Organic Subarctic Plant Essences',
      'Wild Taiga Floral Distillate',
    ],
    servingRitual: 'Serve chilled in a crystal tumbler over clear forest ice with a twist of fresh citrus zest.',
    packOptions: [
      { label: `Single (${volume})`, count: 1, price: price },
      { label: `4-Pack Box`, count: 4, price: Number((price * 3.8).toFixed(2)), savings: 'Save 5%' },
      { label: `12-Pack Case`, count: 12, price: Number((price * 10.8).toFixed(2)), savings: 'Save 10%' },
    ],
  };
}

