// @vitest-environment nuxt
import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import RecipeCard from '~/components/RecipeCard.vue';

const recipe = { id: 7, title: 'Soup', image: 'http://img/7.jpg', usedCount: 3, missedCount: 1 };

describe('RecipeCard', () => {
  it('renders the title and links to the recipe detail', async () => {
    const wrapper = await mountSuspended(RecipeCard, { props: { recipe } });
    expect(wrapper.text()).toContain('Soup');
    expect(wrapper.find('a').attributes('href')).toContain('/recipe/7');
  });

  it('uses the title override when provided', async () => {
    const wrapper = await mountSuspended(RecipeCard, { props: { recipe, title: 'Sopa' } });
    expect(wrapper.text()).toContain('Sopa');
  });
});
