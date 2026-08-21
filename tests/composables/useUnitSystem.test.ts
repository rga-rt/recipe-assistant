// @vitest-environment nuxt
import { describe, it, expect, afterEach } from 'vitest';
import { useUnitSystem } from '~/composables/useUnitSystem';

describe('useUnitSystem', () => {
  afterEach(() => {
    // Restore the default locale for other tests.
    useNuxtApp().$i18n.locale.value = 'en';
  });

  it('derives imperial for English and metric for Spanish', () => {
    const { $i18n } = useNuxtApp();
    const { unitSystem } = useUnitSystem();

    $i18n.locale.value = 'en';
    expect(unitSystem.value).toBe('imperial');

    $i18n.locale.value = 'es';
    expect(unitSystem.value).toBe('metric');
  });
});
