// @vitest-environment nuxt
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mountSuspended } from '@nuxt/test-utils/runtime';

vi.mock('~/utils/favoritesDb', () => ({
  dbGetAll: async () => [], dbPut: async () => {}, dbDelete: async () => {},
}));

// Simulate MyMemory's real artifacts: dirty source names and a hallucinated
// leading number word / trailing period.
const MT: Record<string, string> = {
  'garlic cloves': 'Dos dientes de ajo.',
  'fat bacon cut': 'tocino graso.',
};
vi.mock('~/composables/useTranslate', () => ({
  useTranslate: () => ({ translate: async (arr: string[]) => arr.map((s) => MT[s] ?? s) }),
}));

import RecipeDetailView from '~/components/RecipeDetailView.vue';

function recipe(names: string[]) {
  const empty = { amount: 1, unitShort: '', unitLong: '' };
  return {
    id: 1, title: 'X', image: '', readyInMinutes: 10, servings: 2,
    ingredients: names.map((name, i) => ({ id: i, name, us: empty, metric: empty })),
    steps: [{ number: 1, step: 'Do it' }],
  };
}

describe('RecipeDetailView ingredient-name cleanup (Spanish)', () => {
  afterEach(() => { (useNuxtApp() as any).$i18n.locale.value = 'en'; });

  async function render(names: string[]) {
    const wrapper = await mountSuspended(RecipeDetailView, { props: { recipe: recipe(names) } });
    (useNuxtApp() as any).$i18n.locale.value = 'es';
    await flushPromises();
    return wrapper.text();
  }

  it('drops the hallucinated leading "Dos" from "garlic cloves"', async () => {
    const text = await render(['garlic cloves']);
    expect(text).toContain('dientes de ajo');
    expect(text).not.toContain('Dos dientes de ajo');
  });

  it('cleans the leading "slc" abbreviation before translating the name', async () => {
    const text = await render(['slc fat bacon cut']);
    expect(text).not.toContain('slc');
    expect(text).toContain('tocino graso');
    expect(text).not.toContain('tocino graso.'); // trailing period stripped
  });
});
