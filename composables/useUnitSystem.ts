export function useUnitSystem() {
  // useCookie() returns a brand-new ref on every call, so two independent
  // useUnitSystem() call sites would not observe each other's updates within
  // the same tick (cross-instance sync only happens later via a
  // BroadcastChannel round-trip). Back the reactive value with useState()
  // instead — a single shared ref per app/request — and mirror it to the
  // cookie purely for persistence across reloads.
  const cookie = useCookie<'metric' | 'imperial'>('unit-system', {
    default: () => 'metric',
    sameSite: 'lax',
  });
  const unitSystem = useState<'metric' | 'imperial'>('unit-system', () => cookie.value);
  watch(unitSystem, (value: 'metric' | 'imperial') => {
    cookie.value = value;
  });

  function setSystem(s: 'metric' | 'imperial') {
    unitSystem.value = s;
  }
  function toggle() {
    unitSystem.value = unitSystem.value === 'metric' ? 'imperial' : 'metric';
  }
  return { unitSystem, toggle, setSystem };
}
