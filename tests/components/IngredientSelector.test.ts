// @vitest-environment nuxt
import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
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
});
