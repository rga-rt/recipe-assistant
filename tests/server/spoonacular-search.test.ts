// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for the $fetch auto-import */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const fetchMock = vi.hoisted(() => vi.fn());
vi.stubGlobal('$fetch', fetchMock);

let searchRecipes: typeof import('~/server/utils/spoonacular').searchRecipes;
beforeAll(async () => {
  ({ searchRecipes } = await import('~/server/utils/spoonacular'));
});

const raw = { id: 1, title: 'A', image: 'i', usedIngredientCount: 2, missedIngredientCount: 1, readyInMinutes: 25, aggregateLikes: 1200, healthScore: 64.5 };

describe('searchRecipes', () => {
  beforeEach(() => fetchMock.mockReset());

  it('calls complexSearch with the ranking query and no cuisine by default', async () => {
    fetchMock.mockResolvedValue({ totalResults: 1, results: [raw] });
    await searchRecipes({ ingredients: ['egg', 'rice'], offset: 0, apiKey: 'K' });
    const [url, opts] = fetchMock.mock.calls[0] as [string, any];
    expect(url).toMatch(/\/recipes\/complexSearch$/);
    expect(opts.query).toEqual({
      includeIngredients: 'egg,rice',
      sort: 'max-used-ingredients',
      fillIngredients: true,
      addRecipeInformation: true,
      ignorePantry: true,
      number: 100,
      offset: 0,
      apiKey: 'K',
    });
  });

  it('passes cuisine and offset', async () => {
    fetchMock.mockResolvedValue({ totalResults: 1, results: [raw] });
    await searchRecipes({ ingredients: ['egg'], cuisine: 'thai', offset: 200, apiKey: 'K' });
    const opts = fetchMock.mock.calls[0][1] as any;
    expect(opts.query.cuisine).toBe('thai');
    expect(opts.query.offset).toBe(200);
  });

  it('maps totalResults and results', async () => {
    fetchMock.mockResolvedValue({ totalResults: 2304, results: [raw] });
    const page = await searchRecipes({ ingredients: ['egg'], offset: 0, apiKey: 'K' });
    expect(page).toEqual({
      total: 2304,
      recipes: [{ id: 1, title: 'A', image: 'i', usedCount: 2, missedCount: 1, readyInMinutes: 25, likes: 1200, healthScore: 64.5 }],
    });
  });

  it('retries without sort and fillIngredients when the first batch is empty', async () => {
    fetchMock
      .mockResolvedValueOnce({ totalResults: 0, results: [] })
      .mockResolvedValueOnce({ totalResults: 3, results: [raw] });
    const page = await searchRecipes({ ingredients: ['chicken'], cuisine: 'thai', offset: 0, apiKey: 'K' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((fetchMock.mock.calls[1][1] as any).query).not.toHaveProperty('sort');
    expect((fetchMock.mock.calls[1][1] as any).query).not.toHaveProperty('fillIngredients');
    expect(page.recipes).toHaveLength(1);
    expect(page.total).toBe(3);
  });

  it('does not retry on later offsets', async () => {
    fetchMock.mockResolvedValue({ totalResults: 100, results: [] });
    await searchRecipes({ ingredients: ['egg'], offset: 100, apiKey: 'K' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
