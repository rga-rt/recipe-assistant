import { getStore } from '@netlify/blobs';

interface Entry<T> {
  v: T;
  exp: number;
}

export interface JsonCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
}

export function makeMemoryJsonCache(): JsonCache {
  const store = new Map<string, Entry<unknown>>();
  return {
    async get<T>(key: string): Promise<T | null> {
      const e = store.get(key);
      if (!e) return null;
      if (Date.now() > e.exp) {
        store.delete(key);
        return null;
      }
      return e.v as T;
    },
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      store.set(key, { v: value, exp: Date.now() + ttlMs });
    },
  };
}

const caches = new Map<string, JsonCache>();

// Blobs-backed JSON cache per store name; falls back to an in-memory cache
// when not running in a Netlify runtime (e.g. `nuxt dev`, tests).
export function getJsonCache(storeName: string): JsonCache {
  const existing = caches.get(storeName);
  if (existing) return existing;

  let impl: JsonCache;
  if (process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY) {
    try {
      const store = getStore(storeName);
      impl = {
        async get<T>(key: string): Promise<T | null> {
          const raw = await store.get(key, { type: 'text' });
          if (!raw) return null;
          try {
            const e = JSON.parse(raw) as Entry<T>;
            if (Date.now() > e.exp) return null;
            return e.v;
          } catch {
            return null;
          }
        },
        async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
          await store.set(key, JSON.stringify({ v: value, exp: Date.now() + ttlMs }));
        },
      };
    } catch {
      impl = makeMemoryJsonCache();
    }
  } else {
    impl = makeMemoryJsonCache();
  }
  caches.set(storeName, impl);
  return impl;
}
