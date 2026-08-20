// @vitest-environment nuxt
import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UnitToggle from '~/components/UnitToggle.vue';
import { useUnitSystem } from '~/composables/useUnitSystem';

describe('UnitToggle', () => {
  it('reflects and switches the unit system', async () => {
    const { setSystem } = useUnitSystem();
    setSystem('metric');
    const wrapper = await mountSuspended(UnitToggle);
    await wrapper.find('[data-test="unit-imperial"]').trigger('click');
    expect(useUnitSystem().unitSystem.value).toBe('imperial');
  });
});
