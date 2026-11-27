// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for h3/nuxt auto-imports */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const hoisted = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.stubGlobal('$fetch', hoisted.fetchMock);
vi.stubGlobal('defineEventHandler', (fn: any) => fn);
vi.stubGlobal('getQuery', (e: any) => e.context.query);
vi.stubGlobal('useRuntimeConfig', () => ({ spoonacularApiKey: 'TESTKEY' }));
vi.stubGlobal('createError', (o: any) => Object.assign(new Error(o.statusMessage), o));

vi.mock('#imports', () => ({
  defineEventHandler: (fn: any) => fn,
  getQuery: (e: any) => e.context.query,
  useRuntimeConfig: () => ({ spoonacularApiKey: 'TESTKEY' }),
  createError: (o: any) => Object.assign(new Error(o.statusMessage), o),
}));

// The @nuxt/test-utils vite plugin's unimport transform rewrites the
// handler's bare `useRuntimeConfig()` call into an explicit
// `import { useRuntimeConfig } from '#app/nuxt'` (per .nuxt/imports.d.ts),
// bypassing both the '#imports' mock above and vi.stubGlobal (neither
// intercepts a real static import). Mock that concrete specifier too so
// the call resolves to the test double instead of the real Nuxt app
// runtime (which throws "[nuxt] instance unavailable" outside a request).
vi.mock('#app/nuxt', () => ({
  useRuntimeConfig: () => ({ spoonacularApiKey: 'TESTKEY' }),
}));

// The route caches responses via ~/server/utils/blobCache's getJsonCache.
// Mock it with a fresh in-memory JsonCache per test (reset in beforeEach)
// so cache state never leaks between tests.
const hoistedCache = vi.hoisted(() => {
  function makeCache() {
    const store = new Map<string, unknown>();
    return {
      get: vi.fn(async (key: string) => (store.has(key) ? store.get(key) : null)),
      set: vi.fn(async (key: string, value: unknown, ...ttl: [number]) => {
        void ttl;
        store.set(key, value);
      }),
    };
  }
  return { makeCache, cache: makeCache() };
});

vi.mock('~/server/utils/blobCache', () => ({
  getJsonCache: () => hoistedCache.cache,
}));

// NOTE (harness adaptation): the handler relies on Nuxt/h3 auto-imported
// globals (defineEventHandler, getQuery, createError) rather than importing
// them from '#imports'. A static `import handler from '...'` evaluates
// before the vi.stubGlobal() calls above run (ESM import evaluation
// precedes the importing module's own top-level statements), so the
// globals would not exist yet when the handler module is evaluated. Using
// a dynamic import() inside beforeAll defers loading the handler until
// after the stubs are in place. The handler's production code and the
// test's assertions are unchanged from the brief.
let handler: (event: any) => any;

beforeAll(async () => {
  ({ default: handler } = await import('~/server/api/recipes/by-ingredients.get'));
});

describe('GET /api/recipes/by-ingredients', () => {
  beforeEach(() => {
    hoisted.fetchMock.mockReset();
    hoistedCache.cache = hoistedCache.makeCache();
  });

  const raw = (id: number) => ({ id, title: `R${id}`, image: 'i', usedIngredientCount: 2, missedIngredientCount: 0 });
  const summary = (id: number) => ({ id, title: `R${id}`, image: 'i', usedCount: 2, missedCount: 0 });
  const q = (query: Record<string, string>) => ({ context: { query } }) as any;

  it('returns { total, recipes } from complexSearch', async () => {
    hoisted.fetchMock.mockResolvedValue({ totalResults: 1, results: [raw(1)] });
    const res = await handler(q({ ingredients: 'egg,rice' }));
    expect(res).toEqual({ total: 1, recipes: [summary(1)] });
    expect(hoisted.fetchMock).toHaveBeenCalledOnce();
    expect(hoisted.fetchMock.mock.calls[0][0]).toMatch(/complexSearch$/);
  });

  it('throws 400 when ingredients missing', async () => {
    await expect(handler(q({}))).rejects.toMatchObject({ statusCode: 400 });
  });

  it('caches batch 0 under the sorted key and serves repeats from cache', async () => {
    hoisted.fetchMock.mockResolvedValue({ totalResults: 300, results: Array.from({ length: 100 }, (_, i) => raw(i)) });
    const first = await handler(q({ ingredients: 'rice,egg' }));
    const second = await handler(q({ ingredients: 'egg, rice' }));
    expect(hoisted.fetchMock).toHaveBeenCalledOnce();
    const cached = (await hoistedCache.cache.get('search:all:egg,rice:0')) as any;
    expect(cached.recipes).toHaveLength(100);
    expect(first.total).toBe(300);
    expect(second.recipes.map((r: any) => r.id).sort((a: number, b: number) => a - b)).toEqual(
      cached.recipes.map((r: any) => r.id).sort((a: number, b: number) => a - b),
    );
  });

  it('shuffles batch 0 between requests without changing the cache', async () => {
    hoisted.fetchMock.mockResolvedValue({ totalResults: 100, results: Array.from({ length: 100 }, (_, i) => raw(i)) });
    const a = (await handler(q({ ingredients: 'egg' }))).recipes.map((r: any) => r.id);
    const b = (await handler(q({ ingredients: 'egg' }))).recipes.map((r: any) => r.id);
    expect(a).not.toEqual(b);
    const cached = (await hoistedCache.cache.get('search:all:egg:0')) as any;
    expect(cached.recipes.map((r: any) => r.id)).toEqual(Array.from({ length: 100 }, (_, i) => i));
  });

  it('uses a separate cache entry per cuisine', async () => {
    hoisted.fetchMock.mockResolvedValue({ totalResults: 1, results: [raw(1)] });
    await handler(q({ ingredients: 'egg,rice', cuisine: 'thai' }));
    await handler(q({ ingredients: 'egg,rice' }));
    expect(hoisted.fetchMock).toHaveBeenCalledTimes(2);
    expect((hoisted.fetchMock.mock.calls[0][1] as any).query.cuisine).toBe('thai');
    expect(await hoistedCache.cache.get('search:thai:egg,rice:0')).not.toBeNull();
    expect(await hoistedCache.cache.get('search:all:egg,rice:0')).not.toBeNull();
  });

  it('batch=2 requests offset 200 and keeps API order', async () => {
    hoisted.fetchMock.mockResolvedValue({ totalResults: 500, results: Array.from({ length: 100 }, (_, i) => raw(200 + i)) });
    const res = await handler(q({ ingredients: 'egg', batch: '2' }));
    expect((hoisted.fetchMock.mock.calls[0][1] as any).query.offset).toBe(200);
    expect(res.recipes.map((r: any) => r.id)).toEqual(Array.from({ length: 100 }, (_, i) => 200 + i));
    expect(await hoistedCache.cache.get('search:all:egg:2')).not.toBeNull();
  });

  it('rejects an unknown cuisine with 400', async () => {
    await expect(handler(q({ ingredients: 'egg', cuisine: 'martian' }))).rejects.toMatchObject({ statusCode: 400 });
    expect(hoisted.fetchMock).not.toHaveBeenCalled();
  });

  it.each(['10', '-1', 'abc'])('rejects batch=%s with 400', async (batch) => {
    await expect(handler(q({ ingredients: 'egg', batch }))).rejects.toMatchObject({ statusCode: 400 });
  });

  it('does not cache on upstream error (402)', async () => {
    hoisted.fetchMock.mockRejectedValue({ response: { status: 402 } });
    await expect(handler(q({ ingredients: 'egg,rice' }))).rejects.toMatchObject({ statusCode: 402 });
    expect(hoistedCache.cache.set).not.toHaveBeenCalled();
  });
});
