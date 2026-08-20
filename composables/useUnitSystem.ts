export function useUnitSystem() {
  const unitSystem = useCookie<'metric' | 'imperial'>('unit-system', {
    default: () => 'metric',
    sameSite: 'lax',
  });
  function setSystem(s: 'metric' | 'imperial') {
    unitSystem.value = s;
  }
  function toggle() {
    unitSystem.value = unitSystem.value === 'metric' ? 'imperial' : 'metric';
  }
  return { unitSystem, toggle, setSystem };
}
