/* eslint-disable @typescript-eslint/no-explicit-any -- normalizing an untyped upstream error shape */
import { searchRecipes, BATCH_SIZE } from '~/server/utils/spoonacular';
import { getJsonCache } from '~/server/utils/blobCache';
import { shuffle } from '~/server/utils/recipePool';
import { isCuisine } from '~/data/cuisines';
import type { RecipeSearchPage } from '~/types/recipe';

const TTL_MS = 24 * 60 * 60 * 1000;
// Spoonacular caps offset at 900, so batches 0..9 cover the 1,000 reachable recipes.
const MAX_BATCH = 9;

export default defineEventHandler(async (event) => {
  const { ingredients, cuisine, batch: batchParam } = getQuery(event) as {
    ingredients?: string;
    cuisine?: string;
    batch?: string;
  };
  if (!ingredients || !ingredients.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'ingredients required' });
  }
  const cuisineValue = cuisine?.trim() || undefined;
  if (cuisineValue && !isCuisine(cuisineValue)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid cuisine' });
  }
  const batch = batchParam === undefined || batchParam === '' ? 0 : Number(batchParam);
  if (!Number.isInteger(batch) || batch < 0 || batch > MAX_BATCH) {
    throw createError({ statusCode: 400, statusMessage: 'invalid batch' });
  }

  const apiKey = useRuntimeConfig().spoonacularApiKey;
  const list = ingredients.split(',').map((s) => s.trim()).filter(Boolean);
  const cache = getJsonCache('recipes');
  // v2: pages include readyInMinutes/likes/healthScore for client-side sorting.
  const key = `search:v2:${cuisineValue ?? 'all'}:${[...list].sort().join(',')}:${batch}`;

  let page = await cache.get<RecipeSearchPage>(key);
  if (!page) {
    try {
      page = await searchRecipes({ ingredients: list, cuisine: cuisineValue, offset: batch * BATCH_SIZE, apiKey });
      await cache.set(key, page, TTL_MS);
    } catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode;
      throw createError({ statusCode: status === 402 ? 402 : 502, statusMessage: status === 402 ? 'quota' : 'upstream error' });
    }
  }
  // The first batch is reshuffled on every request so repeat searches show different recipes.
  return batch === 0 ? { total: page.total, recipes: shuffle(page.recipes) } : page;
});
