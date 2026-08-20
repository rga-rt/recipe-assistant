// @vitest-environment nuxt
import { describe, it, expect } from 'vitest';
import { useUnitSystem } from '~/composables/useUnitSystem';

describe('useUnitSystem', () => {
  it('defaults to metric and toggles', () => {
    const { unitSystem, toggle } = useUnitSystem();
    expect(unitSystem.value).toBe('metric');
    toggle();
    expect(unitSystem.value).toBe('imperial');
    toggle();
    expect(unitSystem.value).toBe('metric');
  });
});
