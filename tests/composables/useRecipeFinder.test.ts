// @vitest-environment nuxt
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept to match brief's test verbatim
import { describe, it, expect, beforeEach } from 'vitest';
import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { useRecipeFinder } from '~/composables/useRecipeFinder';

registerEndpoint('/api/recipes/by-ingredients', {
  method: 'GET',
  handler: () => [
    { id: 1, title: 'A', image: 'i', usedCount: 2, missedCount: 0 },
    { id: 2, title: 'B', image: 'i', usedCount: 1, missedCount: 1 },
  ],
});

describe('useRecipeFinder', () => {
  it('toggles selection and disallows duplicates', () => {
    const f = useRecipeFinder();
    f.clear();
    f.toggle('egg');
    f.toggle('rice');
    f.toggle('egg'); // removes egg
    expect(f.selected.value).toEqual(['rice']);
    expect(f.isSelected('rice')).toBe(true);
  });

  it('fetchRecipes fills results and moves to results step', async () => {
    const f = useRecipeFinder();
    f.clear();
    f.toggle('egg');
    await f.fetchRecipes();
    expect(f.results.value.length).toBe(2);
    expect(f.step.value).toBe('results');
    expect(f.error.value).toBeNull();
  });
});
