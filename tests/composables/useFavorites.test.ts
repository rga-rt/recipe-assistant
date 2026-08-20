// @vitest-environment nuxt
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for db layer */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const store = new Map<number, any>();
vi.mock('~/utils/favoritesDb', () => ({
  dbGetAll: vi.fn(async () => [...store.values()]),
  dbPut: vi.fn(async (r: any) => { store.set(r.id, r); }),
  dbDelete: vi.fn(async (id: number) => { store.delete(id); }),
}));

import { useFavorites } from '~/composables/useFavorites';

const sample = (id: number) => ({
  id, title: `R${id}`, image: '', readyInMinutes: 10, servings: 2,
  ingredients: [], steps: [], savedAt: Date.now(),
});

describe('useFavorites', () => {
  beforeEach(() => store.clear());

  it('adds, reports membership, and removes', async () => {
    const f = useFavorites();
    await f.refresh();
    await f.add(sample(1));
    expect(f.isFavorite(1)).toBe(true);
    expect(f.favorites.value.map((r) => r.id)).toContain(1);
    await f.remove(1);
    expect(f.isFavorite(1)).toBe(false);
  });
});
