// @vitest-environment nuxt
import { describe, it, expect } from 'vitest';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { getQuery, createError } from 'h3';

registerEndpoint('/api/ingredients/resolve', {
  method: 'GET',
  handler: (event) => {
    const { q } = getQuery(event) as Record<string, string>;
    if (q === 'nopal') return { token: 'nopales' };
    throw createError({ statusCode: 404, statusMessage: 'not_found' });
  },
});

const flush = () => new Promise((r) => setTimeout(r, 0));
import IngredientSelector from '~/components/IngredientSelector.vue';
import { useRecipeFinder } from '~/composables/useRecipeFinder';

describe('IngredientSelector', () => {
  it('disables Get recipes until an ingredient is picked, then enables it', async () => {
    useRecipeFinder().clear();
    const wrapper = await mountSuspended(IngredientSelector);
    const cta = wrapper.find('[data-test="get-recipes"]');
    expect((cta.element as HTMLButtonElement).disabled).toBe(true);

    await wrapper.find('[data-test="ingredient-tomato"]').trigger('click');
    expect((cta.element as HTMLButtonElement).disabled).toBe(false);
    expect(useRecipeFinder().selected.value).toContain('tomato');
  });

  it('offers All plus the 27 cuisines as single-select pills', async () => {
    const f = useRecipeFinder();
    f.cuisine.value = null;
    const wrapper = await mountSuspended(IngredientSelector);
    const pills = wrapper.findAll('[data-test^="cuisine-"]');
    expect(pills).toHaveLength(28);
    expect(pills[0].attributes('data-test')).toBe('cuisine-all');
    expect(pills[0].text()).toBe('All');
    expect(pills[0].attributes('aria-checked')).toBe('true');

    await wrapper.find('[data-test="cuisine-thai"]').trigger('click');
    expect(f.cuisine.value).toBe('thai');
    expect(wrapper.find('[data-test="cuisine-thai"]').attributes('aria-checked')).toBe('true');
    expect(wrapper.find('[data-test="cuisine-all"]').attributes('aria-checked')).toBe('false');

    await wrapper.find('[data-test="cuisine-all"]').trigger('click');
    expect(f.cuisine.value).toBeNull();
  });

  it('keeps the bottom bar to count, Clear and Get recipes (no cuisine dropdown)', async () => {
    const wrapper = await mountSuspended(IngredientSelector);
    expect(wrapper.find('select').exists()).toBe(false);
    expect(wrapper.find('[data-test="get-recipes"]').exists()).toBe(true);
  });

  it('shows an Add button for text that is not a catalog name', async () => {
    useRecipeFinder().clear();
    const wrapper = await mountSuspended(IngredientSelector);
    const input = wrapper.find('input[type="search"]');

    await input.setValue('nopal');
    expect(wrapper.find('[data-test="add-custom"]').text()).toContain('nopal');

    await input.setValue('   ');
    expect(wrapper.find('[data-test="add-custom"]').exists()).toBe(false);

    await input.setValue('Tomato');
    expect(wrapper.find('[data-test="add-custom"]').exists()).toBe(false);
  });

  it('adds a custom ingredient on Enter and shows it as "typed → token"', async () => {
    useRecipeFinder().clear();
    const wrapper = await mountSuspended(IngredientSelector);
    const input = wrapper.find('input[type="search"]');
    await input.setValue('nopal');
    await input.trigger('keydown', { key: 'Enter' });
    await flush();
    await flush();
    expect(useRecipeFinder().selected.value).toContain('nopales');
    expect(wrapper.text()).toContain('nopal → nopales');
    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('shows a not-found message when the ingredient cannot be resolved', async () => {
    useRecipeFinder().clear();
    const wrapper = await mountSuspended(IngredientSelector);
    const input = wrapper.find('input[type="search"]');
    await input.setValue('xyzzy');
    await wrapper.find('[data-test="add-custom"]').trigger('click');
    await flush();
    await flush();
    expect(wrapper.text()).toContain('We couldn\u2019t find');
  });
});
