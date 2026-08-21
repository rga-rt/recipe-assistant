import { getStore } from '@netlify/blobs';

export interface TranslationCache {
  getMany(keys: string[]): Promise<(string | null)[]>;
  setMany(entries: { key: string; value: string }[]): Promise<void>;
}

export function makeMemoryCache(): TranslationCache {
  const store = new Map<string, string>();
  return {
    async getMany(keys) {
      return keys.map((k) => (store.has(k) ? store.get(k)! : null));
    },
    async setMany(entries) {
      for (const e of entries) store.set(e.key, e.value);
    },
  };
}

// Netlify Blobs-backed cache; falls back to a process-wide memory cache
// when Blobs is unavailable (e.g. plain `nuxt dev` or tests) or when not
// running in a Netlify runtime.
let cached: TranslationCache | null = null;

export function getCache(): TranslationCache {
  if (cached) return cached;

  if (process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY) {
    try {
      const store = getStore('translations');
      cached = {
        async getMany(keys) {
          return Promise.all(keys.map((k) => store.get(k, { type: 'text' }).then((v) => v ?? null)));
        },
        async setMany(entries) {
          await Promise.all(entries.map((e) => store.set(e.key, e.value)));
        },
      };
    } catch {
      cached = makeMemoryCache();
    }
  } else {
    cached = makeMemoryCache();
  }

  return cached;
}
