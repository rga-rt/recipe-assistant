# recipe-assistant

A production-ready **Nuxt 3** app scaffolded with the `nuxt-fullstack-scaffold` skill.

## Stack

- **Nuxt 3** (SSR + server API routes)
- **Tailwind CSS** (`@nuxtjs/tailwindcss`)
- **i18n** (`@nuxtjs/i18n`) — route-prefixed locales `/en`, `/es`
- **Vitest** + `@nuxt/test-utils` + `@vue/test-utils`
- **ESLint + Prettier** (Nuxt preset)
- **TypeScript** (strict mode)

> No database layer was included. See **Adding a database** below to add one later.

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
├── app.vue                       # root component (<NuxtPage />)
├── nuxt.config.ts                # Nuxt + Tailwind + i18n config
├── i18n.config.ts                # vue-i18n base config
├── tailwind.config.ts
├── vitest.config.ts
├── .eslintrc.cjs / .prettierrc
├── tsconfig.json
├── locales/
│   ├── en.json
│   └── es.json
├── pages/
│   └── index.vue                 # home page (fetches /api/recipes)
├── components/
│   ├── LocaleSwitcher.vue
│   └── RecipeCard.vue
├── server/
│   └── api/
│       ├── health.ts             # GET /api/health
│       └── recipes.ts            # GET /api/recipes (in-memory sample data)
├── types/
│   └── recipe.ts                 # shared Recipe type
└── tests/
    └── components/
        └── RecipeCard.test.ts
```

## Internationalization

- Strategy: `prefix` — every route is under a locale (`/en/...`, `/es/...`).
- Default locale: `en`. Add strings in `locales/en.json` and `locales/es.json`.
- The `<LocaleSwitcher />` component switches locales while preserving the route.
- Add a locale by dropping a `locales/<code>.json` file and registering it in
  `nuxt.config.ts` under `i18n.locales`.

## API routes

- `GET /api/health` → `{ status, timestamp }`
- `GET /api/recipes` → sample `Recipe[]` served from memory in
  `server/api/recipes.ts`. Replace this with a database query when you add a DB.

## Adding a database later

The scaffold supports two optional database layers:

- **SQLite + Drizzle** — local, file-based, zero config. Add `drizzle-orm`,
  `better-sqlite3`, `drizzle-kit`, a `server/db/schema.ts`, and `db:push`/`db:seed`
  scripts.
- **Supabase** — managed Postgres + Auth. Add `@supabase/supabase-js`, a
  `server/utils/supabase.ts` client, and `SUPABASE_URL` / `SUPABASE_ANON_KEY`.

## License

MIT
