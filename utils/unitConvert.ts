// Spoonacular sometimes returns imperial units inside a recipe's *metric*
// measure (oz, fl. oz., inches). For the Spanish/metric view we convert those
// to real metric units. Kitchen units that Spanish cooks use directly
// (cup->taza, tbsp->cda, tsp->cdta) are intentionally NOT converted — they're
// translated as words elsewhere — so this returns null for them.

export interface MetricAmount {
  amount: number;
  unit: string; // 'g' | 'kg' | 'ml' | 'l' | 'cm'
}

// Grams per imperial weight unit.
const TO_GRAMS: Record<string, number> = {
  oz: 28.3495, ounce: 28.3495, ounces: 28.3495,
  lb: 453.592, lbs: 453.592, pound: 453.592, pounds: 453.592,
};

// Millilitres per imperial volume unit (US).
const TO_ML: Record<string, number> = {
  'fl oz': 29.5735, 'fl. oz': 29.5735, 'fl. oz.': 29.5735, 'fl. oz.s': 29.5735,
  'fluid ounce': 29.5735, 'fluid ounces': 29.5735,
  pint: 473.176, pints: 473.176,
  quart: 946.353, quarts: 946.353,
  gallon: 3785.41, gallons: 3785.41,
};

// Centimetres per imperial length unit.
const TO_CM: Record<string, number> = { in: 2.54, inch: 2.54, inches: 2.54 };

/**
 * Convert an imperial amount+unit to metric, promoting to kg/L when large.
 * Returns null when the unit isn't an imperial unit we convert.
 */
export function toMetric(amount: number, unit: string): MetricAmount | null {
  const key = unit.trim().toLowerCase();
  if (!key) return null;

  if (key in TO_GRAMS) {
    const g = amount * TO_GRAMS[key];
    return g >= 1000 ? { amount: g / 1000, unit: 'kg' } : { amount: g, unit: 'g' };
  }
  if (key in TO_ML) {
    const ml = amount * TO_ML[key];
    return ml >= 1000 ? { amount: ml / 1000, unit: 'l' } : { amount: ml, unit: 'ml' };
  }
  if (key in TO_CM) {
    return { amount: amount * TO_CM[key], unit: 'cm' };
  }
  return null;
}
