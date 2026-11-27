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

  it('offers All plus the 27 cuisines and stores the choice', async () => {
    const f = useRecipeFinder();
    f.cuisine.value = null;
    const wrapper = await mountSuspended(IngredientSelector);
    const select = wrapper.find('[data-test="cuisine-select"]');
    const options = select.findAll('option');
    expect(options).toHaveLength(28);
    expect(options[0].attributes('value')).toBe('');
    expect(options[0].text()).toBe('All');

    await select.setValue('thai');
    expect(f.cuisine.value).toBe('thai');
    await select.setValue('');
    expect(f.cuisine.value).toBeNull();
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
