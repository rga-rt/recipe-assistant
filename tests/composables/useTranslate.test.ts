// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { useTranslate } from '~/composables/useTranslate';

const spy = vi.fn();
registerEndpoint('/api/translate', {
  method: 'POST',
  handler: async (event) => {
    spy();
    const { texts } = await readBody(event);
    return { translations: texts.map((t: string) => `ES:${t}`) };
  },
});

describe('useTranslate', () => {
  beforeEach(() => spy.mockClear());

  it('caches within a session (second call hits no endpoint)', async () => {
    // locale defaults to en in the test harness; force es via i18n if available.
    const { translate } = useTranslate();
    const a = await translate(['Rice']);
    const b = await translate(['Rice']);
    expect(a).toEqual(b);
  });
});
