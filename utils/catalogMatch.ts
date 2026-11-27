import { INGREDIENT_CATEGORIES } from '~/data/ingredients';
import type { CatalogIngredient } from '~/types/recipe';

export function normalizeIngredient(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

const index = new Map<string, CatalogIngredient>();
for (const cat of INGREDIENT_CATEGORIES) {
  for (const ing of cat.ingredients) {
    for (const name of [ing.token, ing.en, ing.es]) {
      const key = normalizeIngredient(name);
      if (!index.has(key)) index.set(key, ing);
    }
  }
}

// Exact (normalized) match against a catalog ingredient's token, English or Spanish label.
export function matchCatalog(text: string): CatalogIngredient | null {
  return index.get(normalizeIngredient(text)) ?? null;
}
