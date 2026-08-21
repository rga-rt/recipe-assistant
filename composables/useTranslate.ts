export function useTranslate() {
  // useNuxtApp().$i18n (rather than useI18n()) so this composable works both
  // inside component setup and at the top level (e.g. plain functions, tests),
  // since vue-i18n's useI18n() requires an active component instance.
  const { locale } = useNuxtApp().$i18n;
  const cache = useState<Record<string, string>>('translate-cache', () => ({}));

  async function translate(texts: string[]): Promise<string[]> {
    if (locale.value === 'en' || texts.length === 0) return texts;

    const misses: string[] = [];
    for (const t of texts) {
      const key = `${locale.value}:${t}`;
      if (!(key in cache.value) && t.trim()) misses.push(t);
    }

    if (misses.length) {
      try {
        const { translations } = await $fetch<{ translations: string[] }>('/api/translate', {
          method: 'POST',
          body: { texts: misses, target: locale.value },
        });
        misses.forEach((t, i) => { cache.value[`${locale.value}:${t}`] = translations[i] ?? t; });
      } catch {
        misses.forEach((t) => { cache.value[`${locale.value}:${t}`] = t; });
      }
    }

    return texts.map((t) => cache.value[`${locale.value}:${t}`] ?? t);
  }

  return { translate };
}
