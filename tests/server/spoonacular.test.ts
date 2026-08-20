import { describe, it, expect } from 'vitest';
import { mapSummary, mapDetail } from '~/server/utils/spoonacular';

describe('spoonacular mappers', () => {
  it('mapSummary normalizes findByIngredients item', () => {
    const raw = { id: 5, title: 'Soup', image: 'http://x/5.jpg', usedIngredientCount: 3, missedIngredientCount: 1 };
    expect(mapSummary(raw)).toEqual({ id: 5, title: 'Soup', image: 'http://x/5.jpg', usedCount: 3, missedCount: 1 });
  });

  it('mapDetail normalizes information payload with both measures and steps', () => {
    const raw = {
      id: 9, title: 'Rice', image: 'http://x/9.jpg', readyInMinutes: 20, servings: 2,
      extendedIngredients: [
        { id: 1, name: 'rice', measures: {
          us: { amount: 1, unitShort: 'cup', unitLong: 'cup' },
          metric: { amount: 200, unitShort: 'g', unitLong: 'grams' } } },
      ],
      analyzedInstructions: [{ steps: [{ number: 1, step: 'Boil water' }, { number: 2, step: 'Add rice' }] }],
    };
    const d = mapDetail(raw);
    expect(d.ingredients[0]).toEqual({
      id: 1, name: 'rice',
      us: { amount: 1, unitShort: 'cup', unitLong: 'cup' },
      metric: { amount: 200, unitShort: 'g', unitLong: 'grams' },
    });
    expect(d.steps).toEqual([{ number: 1, step: 'Boil water' }, { number: 2, step: 'Add rice' }]);
  });

  it('mapDetail handles missing instructions', () => {
    const d = mapDetail({ id: 1, title: 't', image: '', readyInMinutes: 0, servings: 0, extendedIngredients: [], analyzedInstructions: [] });
    expect(d.steps).toEqual([]);
  });
});
