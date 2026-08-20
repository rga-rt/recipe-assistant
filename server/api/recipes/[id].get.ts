/* eslint-disable @typescript-eslint/no-explicit-any -- normalizing an untyped upstream error shape */
import { getRecipe } from '~/server/utils/spoonacular';

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id');
  const id = Number(idParam);
  if (!idParam || !Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' });
  }
  const apiKey = useRuntimeConfig().spoonacularApiKey;
  try {
    return await getRecipe(id, apiKey);
  } catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode;
    throw createError({ statusCode: status === 402 ? 402 : 502, statusMessage: status === 402 ? 'quota' : 'upstream error' });
  }
});
