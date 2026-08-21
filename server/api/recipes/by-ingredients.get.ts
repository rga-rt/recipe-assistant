/* eslint-disable @typescript-eslint/no-explicit-any -- normalizing an untyped upstream error shape */
import { findByIngredients } from '~/server/utils/spoonacular';
import { getJsonCache } from '~/server/utils/blobCache';
import type { RecipeSummary } from '~/types/recipe';

const TTL_MS = 24 * 60 * 60 * 1000;

export default defineEventHandler(async (event) => {
  const { ingredients } = getQuery(event) as { ingredients?: string };
  if (!ingredients || !ingredients.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'ingredients required' });
  }
  const apiKey = useRuntimeConfig().spoonacularApiKey;
  const list = ingredients.split(',').map((s) => s.trim()).filter(Boolean);
  const cache = getJsonCache('recipes');
  const key = `search:${[...list].sort().join(',')}`;

  const cached = await cache.get<RecipeSummary[]>(key);
  if (cached) return cached;

  try {
    const results = await findByIngredients(list, apiKey);
    await cache.set(key, results, TTL_MS);
    return results;
  } catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode;
    throw createError({ statusCode: status === 402 ? 402 : 502, statusMessage: status === 402 ? 'quota' : 'upstream error' });
  }
});
