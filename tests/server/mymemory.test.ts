// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for h3/nuxt auto-imports */
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

const hoisted = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.stubGlobal('$fetch', hoisted.fetchMock);

// NOTE (harness adaptation): a static `import { createMyMemoryProvider } from
// '...'` evaluates before the vi.stubGlobal() call above runs (ESM import
// evaluation precedes the importing module's own top-level statements). A
// dynamic import() inside beforeAll defers loading the module until after
// the stub is in place. See tests/server/by-ingredients.test.ts.
let createMyMemoryProvider: (email?: string) => { translate: (texts: string[], target: 'es') => Promise<(string | null)[]> };

beforeAll(async () => {
  ({ createMyMemoryProvider } = await import('~/server/utils/translation/mymemory'));
});

describe('createMyMemoryProvider', () => {
  // Reset *after* each test (not before): resetting the mock at the start
  // of a test that installs a rejecting implementation confuses vitest's
  // unhandled-rejection tracking for the mock, misattributing an already
  // try/caught rejection as an unhandled one and failing the test.
  afterEach(() => hoisted.fetchMock.mockReset());

  it('returns the translated text when responseStatus is 200', async () => {
    hoisted.fetchMock.mockResolvedValue({
      responseStatus: 200,
      responseData: { translatedText: 'Arroz' },
    });
    const provider = createMyMemoryProvider();
    const res = await provider.translate(['Rice'], 'es');
    expect(res).toEqual(['Arroz']);
  });

  it('returns null when responseStatus is non-200 (quota warning)', async () => {
    hoisted.fetchMock.mockResolvedValue({
      responseStatus: 403,
      responseData: {
        translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY',
      },
    });
    const provider = createMyMemoryProvider();
    const res = await provider.translate(['Rice'], 'es');
    expect(res).toEqual([null]);
  });

  it('returns null when the fetch throws', async () => {
    hoisted.fetchMock.mockImplementation(() => Promise.reject(new Error('network down')));
    const provider = createMyMemoryProvider();
    const res = await provider.translate(['Rice'], 'es');
    expect(res).toEqual([null]);
  });

  it('returns the blank string unchanged for blank input, without calling fetch', async () => {
    const provider = createMyMemoryProvider();
    const res = await provider.translate(['   '], 'es');
    expect(res).toEqual(['   ']);
    expect(hoisted.fetchMock).not.toHaveBeenCalled();
  });
});
