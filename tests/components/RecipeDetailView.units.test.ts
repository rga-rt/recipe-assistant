// @vitest-environment nuxt
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for db layer */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mountSuspended } from '@nuxt/test-utils/runtime';

vi.mock('~/utils/favoritesDb', () => ({
  dbGetAll: async () => [],
  dbPut: async () => {},
  dbDelete: async () => {},
}));

// Translate is an external MT call; stub it to identity so the component's
// `ready` gate flips deterministically and we can assert on unit rendering.
vi.mock('~/composables/useTranslate', () => ({
  useTranslate: () => ({ translate: async (arr: string[]) => arr }),
}));

import RecipeDetailView from '~/components/RecipeDetailView.vue';
import es from '~/locales/es.json';

function recipeWith(metric: { amount: number; unitShort: string; unitLong: string }) {
  return {
    id: 1, title: 'X', image: '', readyInMinutes: 10, servings: 2,
    ingredients: [{ id: 1, name: 'thing', us: metric, metric }],
    steps: [{ number: 1, step: 'Do it' }],
  };
}

describe('RecipeDetailView Spanish unit rendering', () => {
  afterEach(() => { (useNuxtApp() as any).$i18n.locale.value = 'en'; });

  // Mount, then switch to Spanish post-mount (order-independent vs. app init),
  // and flush so the reactive re-render + async `ready` gate settle.
  async function ingredientLine(metric: { amount: number; unitShort: string; unitLong: string }) {
    const wrapper = await mountSuspended(RecipeDetailView, { props: { recipe: recipeWith(metric) } });
    const i18n = (useNuxtApp() as any).$i18n;
    i18n.setLocaleMessage('es', es); // ES is lazy-loaded at runtime; inject for the test
    i18n.locale.value = 'es';
    await flushPromises();
    return wrapper.text();
  }

  it('translates Spoonacular "Tbsps" (capitalized) to Spanish, not raw "tbsps"', async () => {
    const text = await ingredientLine({ amount: 2, unitShort: 'Tbsps', unitLong: 'Tbsps' });
    expect(text).not.toContain('tbsps');
    expect(text).toContain('cdas');
  });

  it('translates singular "Tbsp" to Spanish, not raw "tbsp"', async () => {
    const text = await ingredientLine({ amount: 1, unitShort: 'Tbsp', unitLong: 'Tbsp' });
    expect(text).not.toContain('tbsp');
    expect(text).toContain('cda');
  });

  it('singularizes "glasses" correctly (never renders the non-word "glasse")', async () => {
    const text = await ingredientLine({ amount: 1, unitShort: 'glasses', unitLong: 'glasses' });
    expect(text).not.toContain('glasse');
    expect(text).toContain('vaso');
  });

  it('pluralizes "glasses" for amounts > 1', async () => {
    const text = await ingredientLine({ amount: 3, unitShort: 'glasses', unitLong: 'glasses' });
    expect(text).toContain('vasos');
  });

  it('handles the "fl. oz.s" abbreviation without mangling it', async () => {
    const text = await ingredientLine({ amount: 8, unitShort: 'fl. oz.', unitLong: 'fl. oz.s' });
    expect(text).not.toContain('fl. oz.s');
    expect(text).toContain('oz líq');
  });

  it('leaves an unknown unit unchanged (no invented word, no capitalization)', async () => {
    const text = await ingredientLine({ amount: 2, unitShort: 'blorp', unitLong: 'blorps' });
    expect(text).toContain('blorps');
  });

  it('translates "ounces" to Spanish, not the English abbreviation "oz"', async () => {
    const text = await ingredientLine({ amount: 24, unitShort: 'oz', unitLong: 'ounces' });
    expect(text).toContain('onzas');
    expect(text).not.toContain('24 oz ');
  });
});
