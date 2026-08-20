/* eslint-disable @typescript-eslint/no-explicit-any -- normalizing an untyped upstream error shape */
import { findByIngredients } from '~/server/utils/spoonacular';

export default defineEventHandler(async (event) => {
  const { ingredients } = getQuery(event) as { ingredients?: string };
  if (!ingredients || !ingredients.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'ingredients required' });
  }
  const apiKey = useRuntimeConfig().spoonacularApiKey;
  const list = ingredients.split(',').map((s) => s.trim()).filter(Boolean);
  try {
    return await findByIngredients(list, apiKey);
  } catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode;
    throw createError({ statusCode: status === 402 ? 402 : 502, statusMessage: status === 402 ? 'quota' : 'upstream error' });
  }
});
