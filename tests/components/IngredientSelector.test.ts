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
});
