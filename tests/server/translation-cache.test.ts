import { describe, it, expect } from 'vitest';
import { sha1 } from '~/server/utils/translation/provider';
import { makeMemoryCache } from '~/server/utils/translation/cache';

describe('translation cache (memory impl)', () => {
  it('sha1 is stable and hex', () => {
    expect(sha1('hello')).toBe(sha1('hello'));
    expect(sha1('hello')).toMatch(/^[0-9a-f]{40}$/);
  });

  it('getMany returns null for misses, values for hits', async () => {
    const c = makeMemoryCache();
    await c.setMany([{ key: 'a', value: 'AA' }]);
    expect(await c.getMany(['a', 'b'])).toEqual(['AA', null]);
  });
});
