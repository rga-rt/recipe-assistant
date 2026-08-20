import { describe, it, expect } from 'vitest';
import { INGREDIENT_CATEGORIES, allTokens } from '~/data/ingredients';

describe('ingredient catalog', () => {
  it('has at least 6 categories, each with ingredients', () => {
    expect(INGREDIENT_CATEGORIES.length).toBeGreaterThanOrEqual(6);
    for (const cat of INGREDIENT_CATEGORIES) {
      expect(cat.id).toMatch(/^[a-z-]+$/);
      expect(cat.ingredients.length).toBeGreaterThan(0);
    }
  });

  it('every ingredient has token, en and es labels', () => {
    for (const cat of INGREDIENT_CATEGORIES) {
      for (const ing of cat.ingredients) {
        expect(ing.token.length).toBeGreaterThan(0);
        expect(ing.en.length).toBeGreaterThan(0);
        expect(ing.es.length).toBeGreaterThan(0);
      }
    }
  });

  it('allTokens returns a unique, flat list', () => {
    const tokens = allTokens();
    expect(tokens.length).toBe(new Set(tokens).size);
    expect(tokens).toContain('chicken breast');
  });
});
