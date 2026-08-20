// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { makeMemoryJsonCache } from '~/server/utils/blobCache';

describe('makeMemoryJsonCache', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips JSON values', async () => {
    const c = makeMemoryJsonCache();
    await c.set('a', { foo: 'bar', n: 1 }, 60_000);
    expect(await c.get('a')).toEqual({ foo: 'bar', n: 1 });
  });

  it('returns null for missing keys', async () => {
    const c = makeMemoryJsonCache();
    expect(await c.get('missing')).toBeNull();
  });

  it('returns null after TTL expiry', async () => {
    const c = makeMemoryJsonCache();
    const now = 1_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    await c.set('a', 'value', 1000);

    vi.spyOn(Date, 'now').mockReturnValue(now + 1001);
    expect(await c.get('a')).toBeNull();
  });

  it('returns value just before TTL expiry', async () => {
    const c = makeMemoryJsonCache();
    const now = 1_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    await c.set('a', 'value', 1000);

    vi.spyOn(Date, 'now').mockReturnValue(now + 999);
    expect(await c.get('a')).toBe('value');
  });
});
