import { COIN_METAL_CONTENT } from './metalMath';

const OZ_TO_GRAMS = 31.1035;
const GRAMS_TO_OZ = 1 / OZ_TO_GRAMS;

function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export function getMetalWeight(item) {
  const count = parseFloat(item.quantity || 1);
  const purity = parseFloat(item.purity || 1);
  const unit = (item.unit || 'oz').toLowerCase().trim();
  const nameKey = normalizeName(item.name);

  // 1. Try coin lookup by name first
  const coinMeta = COIN_METAL_CONTENT[nameKey];
  if (coinMeta?.oz) {
    const oz = coinMeta.oz * count;
    return {
      oz,
      grams: oz * OZ_TO_GRAMS,
      kg: (oz * OZ_TO_GRAMS) / 1000,
    };
  }

  // 2. Unit is oz — multiply by purity for pure metal content
  if (unit === 'oz' || unit === 'troy oz' || unit === 'toz') {
    const oz = count * purity;
    return {
      oz,
      grams: oz * OZ_TO_GRAMS,
      kg: (oz * OZ_TO_GRAMS) / 1000,
    };
  }

  // 3. Unit is grams
  if (unit === 'g' || unit === 'gram' || unit === 'grams') {
    const oz = count * GRAMS_TO_OZ * purity;
    return {
      oz,
      grams: count * purity,
      kg: (count * purity) / 1000,
    };
  }

  // 4. Unit is kg
  if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
    const grams = count * 1000 * purity;
    const oz = grams * GRAMS_TO_OZ;
    return {
      oz,
      grams,
      kg: count * purity,
    };
  }

  // 5. Fallback — treat as oz with purity
  const oz = count * purity;
  return {
    oz,
    grams: oz * OZ_TO_GRAMS,
    kg: (oz * OZ_TO_GRAMS) / 1000,
  };
}