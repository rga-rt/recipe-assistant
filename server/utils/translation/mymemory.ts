import type { TranslationProvider } from './provider';

interface MyMemoryResponse {
  responseStatus?: number | string;
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
            if (Number(res?.responseStatus) === 200 && typeof t === 'string' && t.length) {
              return t;
            }
            return null;
          } catch {
            return null; // could not translate; caller must not cache
          }
        }),
      );
    },
  };
}
