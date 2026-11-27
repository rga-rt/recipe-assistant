// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import RecipeResults from '~/components/RecipeResults.vue';
import { useRecipeFinder } from '~/composables/useRecipeFinder';
import type { RecipeSummary } from '~/types/recipe';

const translateMock = vi.hoisted(() => vi.fn(async (texts: string[]) => texts));
mockNuxtImport('useTranslate', () => () => ({ translate: translateMock }));

const recipes = (n: number): RecipeSummary[] =>
  Array.from({ length: n }, (_, i) => ({ id: i, title: `R${i}`, image: '', usedCount: 1, missedCount: 0 }));

function setState(n: number, total: number) {
  const f = useRecipeFinder();
  f.pending.value = false;
  f.error.value = null;
  f.cuisine.value = null;
  f.results.value = recipes(n);
  f.total.value = total;
  f.visibleCount.value = 24;
  f.loadMoreError.value = null;
  return f;
}

describe('RecipeResults', () => {
  beforeEach(() => translateMock.mockClear());

  it('shows the total count formatted', async () => {
    setState(100, 2304);
    const wrapper = await mountSuspended(RecipeResults);
    expect(wrapper.text()).toContain('2,304 recipes found');
  });

  it('shows Show more while more exist and hides it when all are visible', async () => {
    setState(100, 300);
    const wrapper = await mountSuspended(RecipeResults);
    expect(wrapper.find('[data-test="show-more"]').exists()).toBe(true);

    setState(10, 10);
    const w2 = await mountSuspended(RecipeResults);
    expect(w2.find('[data-test="show-more"]').exists()).toBe(false);
  });

  it('translates only the visible titles', async () => {
    setState(100, 300);
    await mountSuspended(RecipeResults);
    await new Promise((r) => setTimeout(r, 0));
    const lastCall = translateMock.mock.calls.at(-1)![0];
    expect(lastCall).toHaveLength(24);
  });

  it('offers "Try all cuisines" when a cuisine search is empty', async () => {
    const f = setState(0, 0);
    f.cuisine.value = 'thai';
    const wrapper = await mountSuspended(RecipeResults);
    expect(wrapper.text()).toContain('No Thai recipes with these ingredients.');
    const btn = wrapper.find('[data-test="try-all"]');
    expect(btn.exists()).toBe(true);
    await btn.trigger('click');
    expect(f.cuisine.value).toBeNull();
  });

  it('shows the plain empty message without a cuisine', async () => {
    setState(0, 0);
    const wrapper = await mountSuspended(RecipeResults);
    expect(wrapper.text()).toContain('No recipes found');
    expect(wrapper.find('[data-test="try-all"]').exists()).toBe(false);
  });

  it('keeps the grid and shows the error next to Show more when loading more fails', async () => {
    const f = setState(100, 300);
    f.loadMoreError.value = 'generic';
    const wrapper = await mountSuspended(RecipeResults);
    expect(wrapper.findAll('a[href*="/recipe/"]')).toHaveLength(24);
    expect(wrapper.find('[data-test="load-more-error"]').text()).toContain('Something went wrong');
    expect(wrapper.find('[data-test="show-more"]').exists()).toBe(true);
  });
});
