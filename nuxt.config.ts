// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n', '@vite-pwa/nuxt'],
  typescript: {
    strict: true,
  },
  app: {
    // Soften navigations (incl. the locale switch) with a short fade
    // instead of a hard blank frame.
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
  runtimeConfig: {
    spoonacularApiKey: '', // NUXT_SPOONACULAR_API_KEY
    myMemoryEmail: '',     // NUXT_MY_MEMORY_EMAIL
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Recipe Assistant',
      short_name: 'Recipes',
      description: 'Find recipes from the ingredients you have.',
      theme_color: '#111827',
      background_color: '#f9fafb',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.origin === 'https://img.spoonacular.com',
          handler: 'CacheFirst',
          options: { cacheName: 'recipe-images', expiration: { maxEntries: 120, maxAgeSeconds: 604800 } },
        },
      ],
    },
    client: { installPrompt: true },
  },
  i18n: {
    // Keep config + locale files at the project root (v8-style layout)
    restructureDir: false,
    // Opt out of the soon-to-be-deprecated translation-directive optimization
    bundle: {
      optimizeTranslationDirective: false,
    },
    // Base vue-i18n options live in ./i18n.config.ts
    vueI18n: './i18n.config.ts',
    // Message files live in ./locales and are lazy-loaded per locale
    langDir: 'locales',
    lazy: true,
    defaultLocale: 'en',
    strategy: 'prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
    ],
  },
});
