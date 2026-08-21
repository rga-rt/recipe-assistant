# recipe-assistant

[![CI](https://github.com/rga-rt/recipe-assistant/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rga-rt/recipe-assistant/actions/workflows/ci.yml)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)](https://vite-pwa-org.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./README.md#license)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f934c2c5-a4e7-4ba4-a21f-70c0ce00e6bc/deploy-status)](https://app.netlify.com/projects/recipe-assist/deploys)

A **Nuxt 3** recipe finder: pick the ingredients you have on hand, get matching
recipes from Spoonacular, and view full recipe detail — translated to Spanish
on demand, with language-based units (English → imperial, Spanish → metric),
offline-capable favorites, and installable PWA support.

## Stack

- **Nuxt 3** (SSR + server API routes)
- **Tailwind CSS** (`@nuxtjs/tailwindcss`)
- **i18n** (`@nuxtjs/i18n`) — route-prefixed locales `/en`, `/es`
- **IndexedDB** (`idb`) — client-side favorites storage
- **Netlify Blobs** (`@netlify/blobs`) — server-side translation cache
- **PWA** (`@vite-pwa/nuxt`) — installable app + offline asset caching
- **Vitest** + `@nuxt/test-utils` + `@vue/test-utils`
- **ESLint + Prettier** (Nuxt preset)
- **TypeScript** (strict mode)

## Features

- **Finder flow** — select ingredients by category on the start screen, run
  the search, and browse a results grid of recipes ranked by how many of
  your ingredients they use (`pages/index.vue`, `StartScreen.vue`,
  `IngredientSelector.vue`, `RecipeResults.vue`).
- **Recipe detail** — `/recipe/[id]` shows full ingredients, instructions,
  and metadata for a selected recipe, with a favorite toggle
  (`RecipeDetailView.vue`, `FavoriteButton.vue`).
- **i18n (en/es)** — all UI copy, ingredient names, and recipe titles /
  ingredient text are available in English and Spanish via `@nuxtjs/i18n`
  route prefixes and the `/api/translate` route.
- **Metric / imperial units** — a persistent unit toggle
  (`useUnitSystem`, cookie-backed) switches ingredient quantities between
  US customary and metric measurements throughout the app.
- **Favorites (IndexedDB)** — saving a recipe persists its full detail
  payload (plus any cached Spanish translation) to the browser's IndexedDB
  via `useFavorites`, so favorites are available on `/favorites` even
  without a network connection.
- **PWA + offline boundary** — the app is installable and precaches its
  shell and recipe images. **Offline**, you can browse and view your saved
  favorites; **online** is required for searching Spoonacular and for
  on-demand translation. An `OfflineBanner` surfaces connectivity status.

## Environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

| Variable                    | Required | Purpose                                                                 |
| ---------------------------- | -------- | ------------------------------------------------------------------------ |
| `NUXT_SPOONACULAR_API_KEY`   | Yes      | [Spoonacular Food API](https://spoonacular.com/food-api) key — powers ingredient search and recipe detail. |
| `NUXT_MY_MEMORY_EMAIL`       | No       | Email address to pass to the [MyMemory](https://mymemory.translated.net/) translation API, which raises its free daily word quota. |

### Translation

Spanish translation is provided by the free **MyMemory** API and cached
server-side in **Netlify Blobs** (via `@netlify/blobs`) so repeat requests
for the same text are served instantly and don't consume MyMemory's daily
quota. In local `nuxt dev`, the Netlify Blobs client isn't available, so
the same cache interface falls back to an in-memory store automatically —
no extra setup needed. English text is never sent to the translator (it's
returned as-is), and any translation failure falls back to the original
English text rather than breaking the page.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /en)
```

Other scripts:

```bash
npm run test         # run Vitest once
npm run test:watch   # watch mode
npm run test:ui      # Vitest UI dashboard
npm run lint         # ESLint
npm run lint:fix     # ESLint autofix
npm run format       # Prettier
npm run type-check   # nuxi typecheck
npm run build        # production build
```

## Project structure

```
recipe-assistant/
├── app.vue                                # root component (<NuxtPage />)
├── nuxt.config.ts                         # Nuxt + Tailwind + i18n + PWA config
├── netlify.toml                           # Netlify build config
├── i18n.config.ts                         # vue-i18n base config
├── tailwind.config.ts
├── vitest.config.ts
├── .eslintrc.cjs / .prettierrc
├── tsconfig.json
├── .env.example                           # required/optional env vars
├── locales/
│   ├── en.json
│   └── es.json
├── pages/
│   ├── index.vue                          # finder start screen + results
│   ├── favorites.vue                      # saved recipes (offline-capable)
│   └── recipe/[id].vue                    # recipe detail
├── components/
│   ├── AppHeader.vue
│   ├── LocaleSwitcher.vue
│   ├── UnitToggle.vue
│   ├── OfflineBanner.vue
│   ├── StartScreen.vue
│   ├── IngredientCategory.vue / IngredientSelector.vue
│   ├── RecipeResults.vue / RecipeCard.vue
│   ├── RecipeDetailView.vue
│   └── FavoriteButton.vue
├── composables/
│   ├── useRecipeFinder.ts                 # wizard state + search
│   ├── useFavorites.ts                    # IndexedDB persistence
│   ├── useTranslate.ts                    # session-cached translation
│   └── useUnitSystem.ts                   # cookie-backed unit toggle
├── server/
│   ├── api/
│   │   ├── recipes/by-ingredients.get.ts  # Spoonacular ingredient search
│   │   ├── recipes/[id].get.ts            # Spoonacular recipe detail
│   │   └── translate.post.ts              # MyMemory translation (cached)
│   └── utils/
│       ├── spoonacular.ts
│       └── translation/                   # provider, cache (Blobs), mymemory client
├── types/
│   └── recipe.ts                          # shared Recipe/Ingredient types
└── tests/
```

## Internationalization

- Strategy: `prefix` — every route is under a locale (`/en/...`, `/es/...`).
- Default locale: `en`. Add strings in `locales/en.json` and `locales/es.json`.
- The `<LocaleSwitcher />` component switches locales while preserving the route.
- Recipe titles and ingredient text are translated on demand via
  `/api/translate` (see **Translation** above) rather than being pre-bundled.

## Deployment (Netlify)

This project deploys to Netlify via `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

Nuxt's Nitro `netlify` preset is auto-detected during `npm run build` and
emits the static site plus serverless functions for the server API routes.
Set `NUXT_SPOONACULAR_API_KEY` and `NUXT_MY_MEMORY_EMAIL` as environment
variables in the Netlify dashboard before deploying — they are not read
from `.env` in production.

> The exact `publish` directory and Nitro `netlify` preset behavior are
> verified on first connect to Netlify (site build logs will confirm the
> output path matches what Netlify expects).

## License

MIT
