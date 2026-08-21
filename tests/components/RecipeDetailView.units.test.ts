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

  it('handles the "fl. oz.s" abbreviation without mangling it (converts to ml)', async () => {
    const text = await ingredientLine({ amount: 8, unitShort: 'fl. oz.', unitLong: 'fl. oz.s' });
    expect(text).not.toContain('fl. oz.s');
    expect(text).toContain('ml');
  });

  it('leaves an unknown unit unchanged (no invented word, no capitalization)', async () => {
    const text = await ingredientLine({ amount: 2, unitShort: 'blorp', unitLong: 'blorps' });
    expect(text).toContain('blorps');
  });

  it('converts imperial "ounces" in the metric measure to grams (not "oz"/"onzas")', async () => {
    const text = await ingredientLine({ amount: 24, unitShort: 'oz', unitLong: 'ounces' });
    expect(text).toContain('680 g');
    expect(text).not.toContain('oz');
    expect(text).not.toContain('onzas');
  });

  it('converts "fl. oz." to millilitres and "inches" to centimetres', async () => {
    expect(await ingredientLine({ amount: 8, unitShort: 'fl. oz.', unitLong: 'fl. oz.s' })).toContain('ml');
    expect(await ingredientLine({ amount: 4, unitShort: 'inch', unitLong: 'inches' })).toContain('cm');
  });

  it('keeps real Spanish kitchen units (cup -> taza) un-converted', async () => {
    const text = await ingredientLine({ amount: 1, unitShort: 'cup', unitLong: 'cup' });
    expect(text).toContain('taza');
    expect(text).not.toContain('ml');
  });

  it('translates a multi-word "size + noun" unit with Spanish word order', async () => {
    // "large knob" -> "nuez grande" (noun + adjective), not "large knob".
    const text = await ingredientLine({ amount: 1, unitShort: 'large knob', unitLong: 'large knob' });
    expect(text).toContain('nuez grande');
    expect(text).not.toContain('large knob');
  });

  it('pluralizes the noun in a multi-word unit ("large cans" -> "latas grandes")', async () => {
    const text = await ingredientLine({ amount: 2, unitShort: 'large cans', unitLong: 'large cans' });
    expect(text).toContain('latas grandes');
  });

  it('resolves a plural unit via its singular when the plural key is missing ("pinches" -> "pizcas")', async () => {
    const text = await ingredientLine({ amount: 3, unitShort: 'pinches', unitLong: 'pinches' });
    expect(text).toContain('pizcas');
    expect(text).not.toContain('pinches');
  });

  it('normalizes a stray metric plural ("kgs" -> "kg")', async () => {
    const text = await ingredientLine({ amount: 2, unitShort: 'kgs', unitLong: 'kgs' });
    expect(text).toContain('kg');
    expect(text).not.toContain('kgs');
  });
});
