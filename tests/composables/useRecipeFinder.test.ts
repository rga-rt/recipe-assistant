// @vitest-environment nuxt
import { describe, it, expect, beforeEach } from 'vitest';
import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { getQuery, createError } from 'h3';
import { useRecipeFinder } from '~/composables/useRecipeFinder';
import type { RecipeSearchPage, RecipeSummary } from '~/types/recipe';

const recipes = (from: number, n: number): RecipeSummary[] =>
  Array.from({ length: n }, (_, i) => ({ id: from + i, title: `R${from + i}`, image: 'i', usedCount: 1, missedCount: 0 }));

let pages: Record<string, RecipeSearchPage> = {};
const calls: Record<string, string>[] = [];

registerEndpoint('/api/recipes/by-ingredients', {
  method: 'GET',
  handler: (event) => {
    const q = getQuery(event) as Record<string, string>;
    calls.push(q);
    return pages[q.batch ?? '0'];
  },
});

registerEndpoint('/api/ingredients/resolve', {
  method: 'GET',
  handler: (event) => {
    const { q } = getQuery(event) as Record<string, string>;
    if (q === 'nopal') return { token: 'nopales' };
    if (q === 'Jitomate') return { token: 'tomato' };
    throw createError({ statusCode: 404, statusMessage: 'not_found' });
  },
});

function reset() {
  const f = useRecipeFinder();
  f.clear();
  f.cuisine.value = null;
  calls.length = 0;
  return f;
}

describe('useRecipeFinder', () => {
  beforeEach(() => {
    pages = { '0': { total: 2, recipes: recipes(1, 2) } };
  });

  it('toggles selection and disallows duplicates', () => {
    const f = reset();
    f.toggle('egg');
    f.toggle('rice');
    f.toggle('egg');
    expect(f.selected.value).toEqual(['rice']);
    expect(f.isSelected('rice')).toBe(true);
  });

  it('fetchRecipes fills results and moves to results step', async () => {
    const f = reset();
    f.toggle('egg');
    await f.fetchRecipes();
    expect(f.results.value.length).toBe(2);
    expect(f.step.value).toBe('results');
    expect(f.error.value).toBeNull();
  });

  it('stores total and resets paging to the first 24', async () => {
    pages = { '0': { total: 300, recipes: recipes(0, 100) } };
    const f = reset();
    f.toggle('egg');
    f.visibleCount.value = 96;
    await f.fetchRecipes();
    expect(f.total.value).toBe(300);
    expect(f.visible.value).toHaveLength(24);
    expect(f.hasMore.value).toBe(true);
  });

  it('sends cuisine only when set', async () => {
    const f = reset();
    f.toggle('egg');
    await f.fetchRecipes();
    expect(calls[0]).not.toHaveProperty('cuisine');
    f.cuisine.value = 'thai';
    await f.fetchRecipes();
    expect(calls[1].cuisine).toBe('thai');
  });

  it('showMore reveals loaded recipes without fetching', async () => {
    pages = { '0': { total: 300, recipes: recipes(0, 100) } };
    const f = reset();
    f.toggle('egg');
    await f.fetchRecipes();
    await f.showMore();
    expect(f.visible.value).toHaveLength(48);
    expect(calls).toHaveLength(1);
  });

  it('showMore fetches the next batch when loaded recipes run out, deduping ids', async () => {
    pages = {
      '0': { total: 300, recipes: recipes(0, 100) },
      '1': { total: 300, recipes: [...recipes(99, 1), ...recipes(100, 99)] },
    };
    const f = reset();
    f.toggle('egg');
    await f.fetchRecipes();
    f.visibleCount.value = 96;
    await f.showMore();
    expect(calls[1].batch).toBe('1');
    expect(f.results.value).toHaveLength(199);
    expect(f.visible.value).toHaveLength(120);
  });

  it('hasMore is false when everything available is visible', async () => {
    pages = { '0': { total: 30, recipes: recipes(0, 30) } };
    const f = reset();
    f.toggle('egg');
    await f.fetchRecipes();
    await f.showMore();
    expect(f.visible.value).toHaveLength(30);
    expect(f.hasMore.value).toBe(false);
  });

  it('hasMore is false once 1000 recipes are loaded and shown', async () => {
    const f = reset();
    f.results.value = recipes(0, 1000);
    f.total.value = 2304;
    f.visibleCount.value = 1000;
    expect(f.hasMore.value).toBe(false);
  });

  it('searchAllCuisines resets cuisine and refetches without it', async () => {
    const f = reset();
    f.toggle('egg');
    f.cuisine.value = 'thai';
    await f.searchAllCuisines();
    expect(f.cuisine.value).toBeNull();
    expect(calls.at(-1)).not.toHaveProperty('cuisine');
  });

  it('addCustom adds the resolved token and remembers the typed label', async () => {
    const f = reset();
    expect(await f.addCustom('nopal', 'es')).toBe('added');
    expect(f.selected.value).toEqual(['nopales']);
    expect(f.customLabels.value.nopales).toBe('nopal');
  });

  it('addCustom does not store a label for catalog tokens', async () => {
    const f = reset();
    expect(await f.addCustom('Jitomate', 'es')).toBe('added');
    expect(f.selected.value).toEqual(['tomato']);
    expect(f.customLabels.value).not.toHaveProperty('tomato');
  });

  it('addCustom reports duplicates without re-adding', async () => {
    const f = reset();
    await f.addCustom('nopal', 'es');
    expect(await f.addCustom('nopal', 'es')).toBe('duplicate');
    expect(f.selected.value).toEqual(['nopales']);
  });

  it('addCustom maps 404 to not_found', async () => {
    const f = reset();
    expect(await f.addCustom('xyzzy', 'en')).toBe('not_found');
    expect(f.selected.value).toEqual([]);
  });

  it('removing a custom chip or clearing drops its label', async () => {
    const f = reset();
    await f.addCustom('nopal', 'es');
    f.toggle('nopales');
    expect(f.customLabels.value).not.toHaveProperty('nopales');
    await f.addCustom('nopal', 'es');
    f.clear();
    expect(f.customLabels.value).toEqual({});
  });
});
