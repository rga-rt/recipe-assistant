// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for h3/nuxt auto-imports */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const hoisted = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.stubGlobal('$fetch', hoisted.fetchMock);
vi.stubGlobal('defineEventHandler', (fn: any) => fn);
vi.stubGlobal('getRouterParam', (e: any, k: string) => e.context.params[k]);
vi.stubGlobal('useRuntimeConfig', () => ({ spoonacularApiKey: 'TESTKEY' }));
vi.stubGlobal('createError', (o: any) => Object.assign(new Error(o.statusMessage), o));

vi.mock('#imports', () => ({
  defineEventHandler: (fn: any) => fn,
  getRouterParam: (e: any, k: string) => e.context.params[k],
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

// NOTE (harness adaptation): the handler relies on Nuxt/h3 auto-imported
// globals (defineEventHandler, getRouterParam, useRuntimeConfig, createError)
// rather than importing them from '#imports'. A static `import handler from
// '...'` evaluates before the vi.stubGlobal() calls above run (ESM import
// evaluation precedes the importing module's own top-level statements), so
// the globals would not exist yet when the handler module is evaluated.
// Using a dynamic import() inside beforeAll defers loading the handler
// until after the stubs are in place. The handler's production code and
// the test's assertions are unchanged from the brief.
let handler: (event: any) => any;

beforeAll(async () => {
  ({ default: handler } = await import('~/server/api/recipes/[id].get'));
});

describe('GET /api/recipes/:id', () => {
  beforeEach(() => hoisted.fetchMock.mockReset());

  it('returns a normalized detail', async () => {
    hoisted.fetchMock.mockResolvedValue({
      id: 3, title: 'Rice', image: 'i', readyInMinutes: 10, servings: 2,
      extendedIngredients: [], analyzedInstructions: [],
    });
    const res = await handler({ context: { params: { id: '3' } } } as any);
    expect(res.id).toBe(3);
    expect(res.title).toBe('Rice');
  });

  it('throws 400 for non-numeric id', async () => {
    await expect(handler({ context: { params: { id: 'abc' } } } as any)).rejects.toMatchObject({ statusCode: 400 });
  });
});
