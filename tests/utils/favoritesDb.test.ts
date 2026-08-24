// @vitest-environment nuxt
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { reactive } from 'vue';
import { dbPut, dbGetAll, dbDelete } from '~/utils/favoritesDb';
import type { FavoriteRecipe } from '~/types/recipe';

const sample = (id: number): FavoriteRecipe => ({
  id, title: `R${id}`, image: '', readyInMinutes: 10, servings: 2,
  ingredients: [{ id: 1, name: 'onion', us: { amount: 1, unitShort: 'cup', unitLong: 'cup' }, metric: { amount: 240, unitShort: 'ml', unitLong: 'milliliter' } }],
  steps: [{ number: 1, step: 'Chop.' }],
  savedAt: Date.now(),
});

describe('favoritesDb', () => {
  beforeEach(async () => {
    for (const r of await dbGetAll()) await dbDelete(r.id);
  });

  // Regression: the favorite payload passed from the recipe page is a Vue
  // reactive object. IndexedDB uses the structured-clone algorithm, which throws
  // DataCloneError on reactive proxies — so persistence must store a plain copy.
  it('persists a reactive recipe payload without DataCloneError', async () => {
    const recipe = reactive(sample(1));
    await expect(dbPut(recipe)).resolves.toBeUndefined();
    const all = await dbGetAll();
    expect(all.map((r) => r.id)).toContain(1);
  });
});
