import { sha1 } from '~/server/utils/translation/provider';
import { getCache } from '~/server/utils/translation/cache';
import { createMyMemoryProvider } from '~/server/utils/translation/mymemory';

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as { texts?: string[]; target?: 'es' };
  const texts = Array.isArray(body?.texts) ? body.texts : [];
  const target = body?.target ?? 'es';
  if (texts.length === 0) return { translations: [] };

  const cache = getCache();
  const keys = texts.map((t) => `${sha1(t)}:${target}`);
  const cachedValues = await cache.getMany(keys);

  const missIdx = cachedValues.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
  const result = [...cachedValues] as string[];

  if (missIdx.length) {
    const provider = createMyMemoryProvider(useRuntimeConfig().myMemoryEmail || undefined);
    const translated = await provider.translate(
      missIdx.map((i) => texts[i]),
      target,
    );
    const toCache: { key: string; value: string }[] = [];
    missIdx.forEach((i, j) => {
      result[i] = translated[j];
      toCache.push({ key: keys[i], value: translated[j] });
    });
    await cache.setMany(toCache);
  }

  return { translations: result };
});
