// Units follow the language: English → imperial, Spanish → metric.
// Read the locale from useNuxtApp().$i18n (the global composer) so this
// composable is safe to call outside a component setup (e.g. in tests),
// unlike useI18n() which requires an active setup instance.
export function useUnitSystem() {
  const { $i18n } = useNuxtApp();
  const unitSystem = computed<'metric' | 'imperial'>(() =>
    $i18n.locale.value === 'es' ? 'metric' : 'imperial',
  );
  return { unitSystem };
}
