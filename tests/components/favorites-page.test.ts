// @vitest-environment nuxt
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for db layer */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

const store = new Map<number, any>();
vi.mock('~/utils/favoritesDb', () => ({
  dbGetAll: vi.fn(async () => [...store.values()]),
  dbPut: vi.fn(async (r: any) => { store.set(r.id, r); }),
  dbDelete: vi.fn(async (id: number) => { store.delete(id); }),
}));

import FavoritesPage from '~/pages/favorites.vue';

describe('favorites page', () => {
  beforeEach(() => store.clear());

  it('shows empty state when there are no favorites', async () => {
    const wrapper = await mountSuspended(FavoritesPage);
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.text()).toContain('No favorites yet');
  });

  it('lists a saved favorite', async () => {
    store.set(3, { id: 3, title: 'Tarta', image: '', readyInMinutes: 5, servings: 1, ingredients: [], steps: [], savedAt: 1 });
    const wrapper = await mountSuspended(FavoritesPage);
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.text()).toContain('Tarta');
  });
});
