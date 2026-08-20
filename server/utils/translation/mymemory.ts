import type { TranslationProvider } from './provider';

interface MyMemoryResponse {
  responseData?: { translatedText?: string };
}

export function createMyMemoryProvider(email?: string): TranslationProvider {
  return {
    async translate(texts, target) {
      return Promise.all(
        texts.map(async (q) => {
          if (!q.trim()) return q;
          try {
            const res = await $fetch<MyMemoryResponse>('https://api.mymemory.translated.net/get', {
              query: { q, langpair: `en|${target}`, ...(email ? { de: email } : {}) },
            });
            const t = res?.responseData?.translatedText;
            return typeof t === 'string' && t.length ? t : q;
          } catch {
            return q; // graceful fallback to English
          }
        }),
      );
    },
  };
}
