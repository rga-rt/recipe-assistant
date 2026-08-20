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

import FavoriteButton from '~/components/FavoriteButton.vue';

const recipe = { id: 5, title: 'R', image: '', readyInMinutes: 1, servings: 1, ingredients: [], steps: [], savedAt: 0 };

describe('FavoriteButton', () => {
  beforeEach(() => store.clear());

  it('toggles favorite state on click', async () => {
    const wrapper = await mountSuspended(FavoriteButton, { props: { recipe } });
    await wrapper.find('button').trigger('click');
    expect(store.has(5)).toBe(true);
    await wrapper.find('button').trigger('click');
    expect(store.has(5)).toBe(false);
  });
});
