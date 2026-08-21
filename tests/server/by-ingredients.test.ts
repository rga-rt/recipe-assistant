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

  it('returns normalized summaries', async () => {
    hoisted.fetchMock.mockResolvedValue([
      { id: 1, title: 'A', image: 'i', usedIngredientCount: 2, missedIngredientCount: 0 },
    ]);
    const res = await handler({ context: { query: { ingredients: 'egg,rice' } } } as any);
    expect(res).toEqual([{ id: 1, title: 'A', image: 'i', usedCount: 2, missedCount: 0 }]);
    expect(hoisted.fetchMock).toHaveBeenCalledOnce();
  });

  it('throws 400 when ingredients missing', async () => {
    await expect(handler({ context: { query: {} } } as any)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('cache miss: calls Spoonacular once and stores the result under the sorted key', async () => {
    hoisted.fetchMock.mockResolvedValue([
      { id: 2, title: 'B', image: 'i', usedIngredientCount: 1, missedIngredientCount: 1 },
    ]);
    const res = await handler({ context: { query: { ingredients: 'rice,egg' } } } as any);
    expect(res).toEqual([{ id: 2, title: 'B', image: 'i', usedCount: 1, missedCount: 1 }]);
    expect(hoisted.fetchMock).toHaveBeenCalledOnce();
    expect(hoistedCache.cache.set).toHaveBeenCalledOnce();
    // ingredients sorted alphabetically regardless of input order
    expect(await hoistedCache.cache.get('search:egg,rice')).toEqual(res);
  });

  it('cache hit: returns cached value without calling Spoonacular, ignoring ingredient order', async () => {
    const cached = [{ id: 9, title: 'Cached', image: 'i', usedCount: 3, missedCount: 0 }];
    await hoistedCache.cache.set('search:egg,rice', cached, 1000);

    const res = await handler({ context: { query: { ingredients: 'rice, egg' } } } as any);
    expect(res).toEqual(cached);
    expect(hoisted.fetchMock).not.toHaveBeenCalled();
  });

  it('does not cache on upstream error (402)', async () => {
    hoisted.fetchMock.mockRejectedValue({ response: { status: 402 } });
    await expect(
      handler({ context: { query: { ingredients: 'egg,rice' } } } as any),
    ).rejects.toMatchObject({ statusCode: 402 });
    expect(hoistedCache.cache.set).not.toHaveBeenCalled();
    expect(await hoistedCache.cache.get('search:egg,rice')).toBeNull();
  });
});
