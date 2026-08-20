/* eslint-disable @typescript-eslint/no-explicit-any -- normalizing an untyped upstream error shape */
import { getRecipe } from '~/server/utils/spoonacular';
import { getJsonCache } from '~/server/utils/blobCache';
import type { RecipeDetail } from '~/types/recipe';

const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id');
  const id = Number(idParam);
  if (!idParam || !Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' });
  }
  const apiKey = useRuntimeConfig().spoonacularApiKey;
  const cache = getJsonCache('recipes');
  const key = `detail:${id}`;

  const cached = await cache.get<RecipeDetail>(key);
  if (cached) return cached;

  try {
    const detail = await getRecipe(id, apiKey);
    await cache.set(key, detail, TTL_MS);
    return detail;
  } catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode;
    throw createError({ statusCode: status === 402 ? 402 : 502, statusMessage: status === 402 ? 'quota' : 'upstream error' });
  }
});
