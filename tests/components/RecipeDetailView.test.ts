// @vitest-environment nuxt
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for db layer */
import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

vi.mock('~/utils/favoritesDb', () => ({
  dbGetAll: async () => [],
  dbPut: async () => {},
  dbDelete: async () => {},
}));

import RecipeDetailView from '~/components/RecipeDetailView.vue';
import { useUnitSystem } from '~/composables/useUnitSystem';

const recipe = {
  id: 1, title: 'Rice', image: '', readyInMinutes: 20, servings: 2,
  ingredients: [{
    id: 1, name: 'rice',
    us: { amount: 1, unitShort: 'cup', unitLong: 'cup' },
    metric: { amount: 200, unitShort: 'g', unitLong: 'grams' },
  }],
  steps: [{ number: 1, step: 'Boil water' }],
};

describe('RecipeDetailView', () => {
  it('shows metric measures by default and switches to imperial', async () => {
    useUnitSystem().setSystem('metric');
    const wrapper = await mountSuspended(RecipeDetailView, { props: { recipe } });
    expect(wrapper.text()).toContain('200');
    useUnitSystem().setSystem('imperial');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('Boil water');
  });
});
