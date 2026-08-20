import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import RecipeCard from '~/components/RecipeCard.vue';
import type { Recipe } from '~/types/recipe';

const recipe: Recipe = {
  id: 1,
  title: 'Classic Margherita Pizza',
  description: 'Blistered crust, San Marzano tomato, fresh mozzarella, basil.',
  minutes: 45,
  tags: ['italian', 'vegetarian'],
};

describe('RecipeCard', () => {
  it('renders the recipe title and description', async () => {
    const wrapper = await mountSuspended(RecipeCard, {
      props: { recipe },
    });

    expect(wrapper.text()).toContain('Classic Margherita Pizza');
    expect(wrapper.text()).toContain('San Marzano tomato');
  });

  it('renders each tag', async () => {
    const wrapper = await mountSuspended(RecipeCard, {
      props: { recipe },
    });

    for (const tag of recipe.tags) {
      expect(wrapper.text()).toContain(tag);
    }
  });

  it('shows the cook time', async () => {
    const wrapper = await mountSuspended(RecipeCard, {
      props: { recipe },
    });

    expect(wrapper.text()).toContain('45');
  });
});
