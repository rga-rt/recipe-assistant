// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for h3/nuxt auto-imports */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const hoisted = vi.hoisted(() => ({ fetchMock: vi.fn(), translateMock: vi.fn() }));
const config = { spoonacularApiKey: 'TESTKEY', myMemoryEmail: '' };

vi.stubGlobal('$fetch', hoisted.fetchMock);
vi.stubGlobal('defineEventHandler', (fn: any) => fn);
vi.stubGlobal('getQuery', (e: any) => e.context.query);
vi.stubGlobal('useRuntimeConfig', () => config);
vi.stubGlobal('createError', (o: any) => Object.assign(new Error(o.statusMessage), o));
vi.mock('#imports', () => ({
  defineEventHandler: (fn: any) => fn,
  getQuery: (e: any) => e.context.query,
  useRuntimeConfig: () => config,
  createError: (o: any) => Object.assign(new Error(o.statusMessage), o),
}));
// See tests/server/by-ingredients.test.ts for why '#app/nuxt' is mocked too.
vi.mock('#app/nuxt', () => ({ useRuntimeConfig: () => config }));

vi.mock('~/server/utils/translation/mymemory', () => ({
  createMyMemoryProvider: () => ({ translate: hoisted.translateMock }),
}));

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
vi.mock('~/server/utils/blobCache', () => ({ getJsonCache: () => hoistedCache.cache }));

let handler: (event: any) => any;
beforeAll(async () => {
  ({ default: handler } = await import('~/server/api/ingredients/resolve.get'));
});

const q = (query: Record<string, string>) => ({ context: { query } }) as any;

describe('GET /api/ingredients/resolve', () => {
  beforeEach(() => {
    hoisted.fetchMock.mockReset();
    hoisted.translateMock.mockReset();
    hoistedCache.cache = hoistedCache.makeCache();
  });

  it('returns the catalog token without upstream calls', async () => {
    const res = await handler(q({ q: 'Jitomate', locale: 'es' }));
    expect(res).toEqual({ token: 'tomato' });
    expect(hoisted.fetchMock).not.toHaveBeenCalled();
    expect(hoisted.translateMock).not.toHaveBeenCalled();
  });

  it('es: translates to English, then validates with autocomplete', async () => {
    hoisted.translateMock.mockResolvedValue(['cactus']);
    hoisted.fetchMock.mockResolvedValue([{ name: 'nopales' }]);
    const res = await handler(q({ q: 'nopal', locale: 'es' }));
    expect(res).toEqual({ token: 'nopales' });
    expect(hoisted.translateMock).toHaveBeenCalledWith(['nopal'], 'en');
    const [url, opts] = hoisted.fetchMock.mock.calls[0];
    expect(url).toMatch(/\/food\/ingredients\/autocomplete$/);
    expect(opts.query).toEqual({ query: 'cactus', number: 1, apiKey: 'TESTKEY' });
  });

  it('es: falls back to the original text when translation fails', async () => {
    hoisted.translateMock.mockResolvedValue([null]);
    hoisted.fetchMock.mockResolvedValue([{ name: 'nopales' }]);
    await handler(q({ q: 'nopal', locale: 'es' }));
    expect(hoisted.fetchMock.mock.calls[0][1].query.query).toBe('nopal');
  });

  it('es: does not cache a result built on a failed translation', async () => {
    hoisted.translateMock.mockResolvedValue([null]);
    hoisted.fetchMock.mockResolvedValue([]);
    await expect(handler(q({ q: 'xoconostle', locale: 'es' }))).rejects.toMatchObject({ statusCode: 404 });
    expect(hoistedCache.cache.set).not.toHaveBeenCalled();
  });

  it('es: retries autocomplete with the original word when the translation finds nothing', async () => {
    hoisted.translateMock.mockResolvedValue(['prickly pear cactus']);
    hoisted.fetchMock.mockResolvedValueOnce([]).mockResolvedValueOnce([{ name: 'nopales' }]);
    const res = await handler(q({ q: 'nopal', locale: 'es' }));
    expect(res).toEqual({ token: 'nopales' });
    expect(hoisted.fetchMock.mock.calls.map((c: any) => c[1].query.query)).toEqual(['prickly pear cactus', 'nopal']);
  });

  it('en: skips translation', async () => {
    hoisted.fetchMock.mockResolvedValue([{ name: 'fish sauce' }]);
    const res = await handler(q({ q: 'Fish sauce', locale: 'en' }));
    expect(res).toEqual({ token: 'fish sauce' });
    expect(hoisted.translateMock).not.toHaveBeenCalled();
  });

  it('404 when autocomplete finds nothing, and the miss is cached', async () => {
    hoisted.fetchMock.mockResolvedValue([]);
    await expect(handler(q({ q: 'xyzzy', locale: 'en' }))).rejects.toMatchObject({ statusCode: 404 });
    hoisted.fetchMock.mockClear();
    await expect(handler(q({ q: ' XYZZY ', locale: 'en' }))).rejects.toMatchObject({ statusCode: 404 });
    expect(hoisted.fetchMock).not.toHaveBeenCalled();
  });

  it('caches hits for 30 days under locale:normalized', async () => {
    hoisted.fetchMock.mockResolvedValue([{ name: 'fish sauce' }]);
    await handler(q({ q: 'Fish  Sauce', locale: 'en' }));
    expect(hoistedCache.cache.set).toHaveBeenCalledWith('en:fish sauce', { token: 'fish sauce' }, 30 * 24 * 60 * 60 * 1000);
  });

  it('maps upstream 402 to quota', async () => {
    hoisted.fetchMock.mockRejectedValue({ response: { status: 402 } });
    await expect(handler(q({ q: 'kombu', locale: 'en' }))).rejects.toMatchObject({ statusCode: 402, statusMessage: 'quota' });
  });

  it('400 on blank q', async () => {
    await expect(handler(q({ q: '   ', locale: 'en' }))).rejects.toMatchObject({ statusCode: 400 });
  });
});
