// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for h3/nuxt auto-imports */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const hoisted = vi.hoisted(() => ({
  cache: {
    store: new Map<string, string>(),
    getMany: vi.fn(async (keys: string[]) => keys.map((k) => hoisted.cache.store.get(k) ?? null)),
    setMany: vi.fn(async (entries: { key: string; value: string }[]) => {
      for (const e of entries) hoisted.cache.store.set(e.key, e.value);
    }),
  },
  provider: { translate: vi.fn(async (texts: string[]) => texts.map((t) => `ES:${t}`)) },
}));

vi.stubGlobal('defineEventHandler', (fn: any) => fn);
vi.stubGlobal('readBody', (e: any) => e.context.body);
vi.stubGlobal('createError', (o: any) => Object.assign(new Error(o.statusMessage), o));
vi.stubGlobal('useRuntimeConfig', () => ({ myMemoryEmail: '' }));

vi.mock('~/server/utils/translation/cache', () => ({ getCache: () => hoisted.cache }));
vi.mock('~/server/utils/translation/mymemory', () => ({ createMyMemoryProvider: () => hoisted.provider }));
vi.mock('#imports', () => ({
  defineEventHandler: (fn: any) => fn,
  readBody: (e: any) => e.context.body,
  useRuntimeConfig: () => ({ myMemoryEmail: '' }),
  createError: (o: any) => Object.assign(new Error(o.statusMessage), o),
}));

// See tests/server/by-ingredients.test.ts: the @nuxt/test-utils vite
// plugin's unimport transform rewrites the handler's bare
// `useRuntimeConfig()` call into an explicit
// `import { useRuntimeConfig } from '#app/nuxt'`, bypassing both the
// '#imports' mock above and vi.stubGlobal (neither intercepts a real
// static import). Mock that concrete specifier too.
vi.mock('#app/nuxt', () => ({
  useRuntimeConfig: () => ({ myMemoryEmail: '' }),
}));

// NOTE (harness adaptation): a static `import handler from '...'` evaluates
// before the vi.stubGlobal() calls above run (ESM import evaluation
// precedes the importing module's own top-level statements), so the
// globals would not exist yet when the handler module is evaluated. Using
// a dynamic import() inside beforeAll defers loading the handler until
// after the stubs are in place. See tests/server/by-ingredients.test.ts.
let handler: (event: any) => any;

beforeAll(async () => {
  ({ default: handler } = await import('~/server/api/translate.post'));
});

describe('POST /api/translate', () => {
  beforeEach(() => {
    hoisted.cache.store.clear();
    hoisted.provider.translate.mockClear();
  });

  it('translates misses and caches them', async () => {
    const res = await handler({ context: { body: { texts: ['Rice', 'Soup'], target: 'es' } } } as any);
    expect(res).toEqual({ translations: ['ES:Rice', 'ES:Soup'] });
    expect(hoisted.provider.translate).toHaveBeenCalledOnce();
  });

  it('serves cached hits without calling the provider', async () => {
    await handler({ context: { body: { texts: ['Rice'], target: 'es' } } } as any);
    hoisted.provider.translate.mockClear();
    const res = await handler({ context: { body: { texts: ['Rice'], target: 'es' } } } as any);
    expect(res).toEqual({ translations: ['ES:Rice'] });
    expect(hoisted.provider.translate).not.toHaveBeenCalled();
  });

  it('returns empty array for empty input', async () => {
    const res = await handler({ context: { body: { texts: [], target: 'es' } } } as any);
    expect(res).toEqual({ translations: [] });
  });
});
