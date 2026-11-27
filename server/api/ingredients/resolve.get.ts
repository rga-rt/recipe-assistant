/* eslint-disable @typescript-eslint/no-explicit-any -- normalizing an untyped upstream error shape */
import { autocompleteIngredient } from '~/server/utils/spoonacular';
import { getJsonCache } from '~/server/utils/blobCache';
import { createMyMemoryProvider } from '~/server/utils/translation/mymemory';
import { matchCatalog, normalizeIngredient } from '~/utils/catalogMatch';

const TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Turns a typed ingredient (English or Spanish) into a Spoonacular ingredient token:
// catalog match → (Spanish) machine translation → Spoonacular autocomplete as validation.
export default defineEventHandler(async (event) => {
  const { q, locale } = getQuery(event) as { q?: string; locale?: string };
  const text = q?.trim() ?? '';
  if (!text) throw createError({ statusCode: 400, statusMessage: 'q required' });
  const lang = locale === 'es' ? 'es' : 'en';

  const catalog = matchCatalog(text);
  if (catalog) return { token: catalog.token };

  const cache = getJsonCache('ingredients');
  const key = `${lang}:${normalizeIngredient(text)}`;
  const cached = await cache.get<{ token: string | null }>(key);
  if (cached) {
    if (cached.token) return { token: cached.token };
    throw createError({ statusCode: 404, statusMessage: 'not_found' });
  }

  let query = text;
  if (lang === 'es') {
    const provider = createMyMemoryProvider(useRuntimeConfig().myMemoryEmail || undefined);
    const [translated] = await provider.translate([text], 'en');
    if (translated) query = translated;
  }

  let token: string | null;
  try {
    const apiKey = useRuntimeConfig().spoonacularApiKey;
    token = await autocompleteIngredient(query, apiKey);
    // MT can over-expand words Spoonacular already knows ("nopal" → "prickly pear
    // cactus"), so fall back to the word as typed.
    if (!token && query !== text) token = await autocompleteIngredient(text, apiKey);
  } catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode;
    throw createError({ statusCode: status === 402 ? 402 : 502, statusMessage: status === 402 ? 'quota' : 'upstream error' });
  }

  await cache.set(key, { token }, TTL_MS);
  if (!token) throw createError({ statusCode: 404, statusMessage: 'not_found' });
  return { token };
});
