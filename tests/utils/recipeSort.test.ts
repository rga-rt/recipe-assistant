import { describe, it, expect } from 'vitest';
import { sortRecipes, RECIPE_SORTS } from '~/utils/recipeSort';
import type { RecipeSummary } from '~/types/recipe';

const r = (id: number, o: Partial<RecipeSummary> = {}): RecipeSummary => ({
  id, title: `R${id}`, image: '', usedCount: 1, missedCount: 0, ...o,
});

describe('sortRecipes', () => {
  it('offers exactly the five sorts, best match first', () => {
    expect(RECIPE_SORTS).toEqual(['best', 'fewest-missing', 'quickest', 'popular', 'healthiest']);
  });

  it('best keeps per-page ranking (never moves items across pages of 24)', () => {
    const items = [...Array.from({ length: 24 }, (_, i) => r(i, { missedCount: 5 })), r(100, { missedCount: 0 })];
    expect(sortRecipes(items, 'best').at(-1)!.id).toBe(100);
  });

  it('fewest-missing sorts all loaded recipes by missedCount, then usedCount desc', () => {
    const out = sortRecipes([r(1, { missedCount: 3 }), r(2, { missedCount: 0, usedCount: 1 }), r(3, { missedCount: 0, usedCount: 4 })], 'fewest-missing');
    expect(out.map((x) => x.id)).toEqual([3, 2, 1]);
  });

  it('quickest sorts by readyInMinutes ascending with unknown times last', () => {
    const out = sortRecipes([r(1, { readyInMinutes: 45 }), r(2), r(3, { readyInMinutes: 10 })], 'quickest');
    expect(out.map((x) => x.id)).toEqual([3, 1, 2]);
  });

  it('popular sorts by likes descending', () => {
    const out = sortRecipes([r(1, { likes: 5 }), r(2, { likes: 900 }), r(3)], 'popular');
    expect(out.map((x) => x.id)).toEqual([2, 1, 3]);
  });

  it('healthiest sorts by healthScore descending', () => {
    const out = sortRecipes([r(1, { healthScore: 20 }), r(2, { healthScore: 80 }), r(3)], 'healthiest');
    expect(out.map((x) => x.id)).toEqual([2, 1, 3]);
  });

  it('does not mutate its input', () => {
    const items = [r(1, { likes: 1 }), r(2, { likes: 2 })];
    const copy = structuredClone(items);
    sortRecipes(items, 'popular');
    expect(items).toEqual(copy);
  });
});
