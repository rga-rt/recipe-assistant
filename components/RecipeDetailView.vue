<template>
  <article class="container mx-auto max-w-2xl px-4 py-10">
    <NuxtLinkLocale to="/" class="text-sm text-stone-500 transition hover:text-kale">← {{ t('recipe.back') }}</NuxtLinkLocale>

    <img v-if="recipe.image" :src="recipe.image" :alt="title" class="mt-4 aspect-[16/9] w-full rounded-2xl object-cover" >
    <div class="mt-6 flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <h1 v-if="ready" class="text-3xl font-bold text-kale sm:text-4xl">{{ title }}</h1>
        <div v-else class="h-9 w-2/3 animate-pulse rounded bg-stone-100"></div>
        <p class="num mt-2 text-sm text-stone-600">
          {{ t('recipe.readyIn', { minutes: recipe.readyInMinutes }) }} &middot; {{ t('recipe.servings', { count: recipe.servings }, recipe.servings) }}
        </p>
      </div>
      <FavoriteButton :recipe="favoritePayload" />
    </div>

    <h2 class="mt-10 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">{{ t('recipe.ingredients') }}</h2>
    <ul v-if="ready" class="mt-4 space-y-2">
      <li v-for="(ing, i) in recipe.ingredients" :key="ing.id" class="flex items-baseline gap-2 text-kale">
        <span v-if="formatMeasure(ing)" class="num font-medium text-kale">{{ formatMeasure(ing) }}</span>
        <span>{{ ingredientLabel(ing, ingredientNames[i] ?? ing.name) }}</span>
      </li>
    </ul>
    <ul v-else class="mt-4 space-y-2">
      <li v-for="n in recipe.ingredients.length || 4" :key="n" class="h-4 animate-pulse rounded bg-stone-100" :style="{ width: `${55 + ((n * 13) % 35)}%` }"></li>
    </ul>

    <h2 class="mt-10 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">{{ t('recipe.instructions') }}</h2>
    <p
      v-if="recipe.steps.length && unitSystem === 'metric'"
      class="mt-2 text-xs text-stone-500"
    >
      {{ t('recipe.stepsNote') }}
    </p>
    <p v-if="recipe.steps.length === 0" class="mt-3 text-stone-500">{{ t('recipe.noInstructions') }}</p>
    <ol v-else-if="ready" class="mt-4 space-y-4">
      <li v-for="(s, i) in recipe.steps" :key="s.number" class="flex gap-3 text-kale">
        <span class="num flex h-6 w-6 flex-none items-center justify-center rounded-full bg-basil text-xs font-semibold text-chalk">{{ i + 1 }}</span>
        <span class="pt-0.5">{{ stepTexts[i] ?? s.step }}</span>
      </li>
    </ol>
    <div v-else class="mt-4 space-y-3">
      <div v-for="n in recipe.steps.length || 3" :key="n" class="h-4 w-full animate-pulse rounded bg-stone-100"></div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { RecipeDetail, RecipeIngredient, FavoriteRecipe } from '~/types/recipe';
import { cleanIngredientName, sanitizeTranslatedName, capitalizeFirst } from '~/utils/ingredientName';
import { toMetric } from '~/utils/unitConvert';

const props = defineProps<{ recipe: RecipeDetail }>();
const { t, tm, rt, locale } = useI18n();
const { unitSystem } = useUnitSystem();
const { translate } = useTranslate();

// Spoonacular ingredient names arrive dirty; clean them once for both the
// English display and as the input to translation.
const cleanNames = props.recipe.ingredients.map((i) => cleanIngredientName(i.name));

const title = ref(props.recipe.title);
const ingredientNames = ref<string[]>([...cleanNames]);
const stepTexts = ref<string[]>(props.recipe.steps.map((s) => s.step));
// English needs no translation, so it's ready immediately; Spanish is gated
// until title/ingredients/steps all resolve, to avoid an English flash.
const ready = ref(false);

watchEffect(async () => {
  if (locale.value !== 'es') {
    title.value = props.recipe.title;
    ingredientNames.value = [...cleanNames];
    stepTexts.value = props.recipe.steps.map((s) => s.step);
    ready.value = true;
    return;
  }
  ready.value = false;
  const [tt, names, steps] = await Promise.all([
    translate([props.recipe.title]),
    translate(cleanNames),
    translate(props.recipe.steps.map((s) => s.step)),
  ]);
  title.value = tt[0];
  // Strip MyMemory artifacts (spurious leading number word, trailing period)
  // from ingredient names only — step text may legitimately start with a number.
  ingredientNames.value = names.map((n, i) => sanitizeTranslatedName(cleanNames[i], n));
  stepTexts.value = steps;
  ready.value = true;
});

// Look up a unit word in the locale dictionary, case-insensitively (Spoonacular
// sends forms like "Tbsps" while other units arrive lowercase). Returns the
// translated word, or null when the term isn't a known unit.
function unitWord(word: string): string | null {
  const words = tm('units.words') as Record<string, unknown>;
  if (!words || !word) return null;
  if (word in words) return rt(words[word] as string);
  const lower = word.toLowerCase();
  for (const key in words) {
    if (key.toLowerCase() === lower) return rt(words[key] as string);
  }
  return null;
}

// English singular/plural inflection that respects sibilant endings, so we never
// emit non-words like "glasse" (from "glasses") or "fl. oz.s".
function singularizeUnit(w: string): string {
  const lower = w.toLowerCase();
  if (/(?:s|sh|ch|x|z)es$/.test(lower)) return w.slice(0, -2);
  if (/ies$/.test(lower)) return `${w.slice(0, -3)}y`;
  if (/ss$/.test(lower)) return w;
  if (/s$/.test(lower)) return w.slice(0, -1);
  return w;
}
function pluralizeUnit(w: string): string {
  const lower = w.toLowerCase();
  if (/(?:s|sh|ch|x|z)$/.test(lower)) return `${w}es`;
  if (/[^aeiou]y$/.test(lower)) return `${w.slice(0, -1)}ies`;
  return `${w}s`;
}

// Snap imperial volumes to the fractions a cook actually uses (⅓ cup, not 0.3).
const FRACTIONS: Array<[number, string]> = [
  [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'], [0.5, '½'], [0.667, '⅔'], [0.75, '¾'],
];
const VOLUME_UNITS = ['cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'tbsps', 'tb', 'tbs', 'teaspoon', 'teaspoons', 'tsp'];
function snapFraction(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.06) return String(whole);
  if (1 - frac < 0.06) return String(whole + 1);
  let best = FRACTIONS[0];
  for (const f of FRACTIONS) {
    if (Math.abs(frac - f[0]) < Math.abs(frac - best[0])) best = f;
  }
  return whole > 0 ? `${whole}${best[1]}` : best[1];
}
function prettyAmount(amount: number, unitShort: string): string {
  const u = unitShort.toLowerCase();
  const bulkMetric = ['g', 'ml', 'gram', 'grams', 'milliliter', 'milliliters'].includes(u);
  if (bulkMetric) {
    if (Number.isInteger(amount)) return String(amount);
    if (amount >= 100) return String(Math.round(amount / 5) * 5);
    if (amount >= 10) return String(Math.round(amount));
    return String(Math.round(amount * 10) / 10);
  }
  if (VOLUME_UNITS.includes(u) && !Number.isInteger(amount)) return snapFraction(amount);
  if (Number.isInteger(amount)) return String(amount);
  return String(Math.round(amount * 10) / 10);
}
function formatMeasure(ing: RecipeIngredient): string {
  let m = unitSystem.value === 'metric' ? ing.metric : ing.us;
  // Spoonacular sometimes returns imperial units inside the metric measure
  // (oz, fl. oz., inches). On the metric (Spanish) side, convert those.
  if (unitSystem.value === 'metric') {
    const converted = toMetric(m.amount, m.unitShort || m.unitLong);
    if (converted) m = { amount: converted.amount, unitShort: converted.unit, unitLong: converted.unit };
  }
  const rawUnit = (m.unitShort || m.unitLong || '').toLowerCase();
  // "serving"/"servings" is a placeholder unit (e.g. "salt and pepper to taste") — omit it.
  if (['serving', 'servings'].includes(rawUnit)) return '';
  const amount = prettyAmount(m.amount, m.unitShort);
  const raw = (m.unitLong || m.unitShort || '').trim();
  return `${amount} ${translateUnit(raw, m.amount)}`.trim();
}

// Size adjectives Spoonacular uses as (or in front of) units.
const SIZE_WORDS = new Set([
  'large', 'larges', 'small', 'smalls', 'medium', 'mediums', 'big', 'little', 'jumbo', 'jumbos',
]);

// Translate one unit word: try the amount-appropriate English form, then the raw
// form, then the singular (so a missing plural key like "pinches" still resolves
// via "pinch"). Returns null when the word isn't a known unit.
function resolveUnit(word: string, amount: number): string | null {
  const wanted = amount <= 1 ? singularizeUnit(word) : pluralizeUnit(singularizeUnit(word));
  return unitWord(wanted) ?? unitWord(word) ?? unitWord(singularizeUnit(word));
}

// Translate a (possibly multi-word) unit. "large knob" -> "nuez grande" in
// Spanish (noun + adjective order), "large knob" in English. Unknown units fall
// back to the raw text unchanged — never an invented word.
function translateUnit(raw: string, amount: number): string {
  if (!raw) return raw;
  const direct = resolveUnit(raw, amount);
  if (direct) return direct;
  const tokens = raw.split(/\s+/);
  if (tokens.length === 2 && SIZE_WORDS.has(tokens[0].toLowerCase())) {
    const adj = resolveUnit(tokens[0], amount) ?? tokens[0];
    const noun = resolveUnit(tokens[1], amount) ?? tokens[1];
    return locale.value === 'es' ? `${noun} ${adj}` : `${adj} ${noun}`;
  }
  return raw;
}

// Capitalize the ingredient name only when it leads the line (no measure in
// front). Number-led lines like "3 dientes de ajo" stay lowercase after the
// number; placeholder items like "salt to taste" become "Salt to taste".
function ingredientLabel(ing: RecipeIngredient, name: string): string {
  return formatMeasure(ing) ? name : capitalizeFirst(name);
}

const favoritePayload = computed<FavoriteRecipe>(() => ({
  ...props.recipe,
  savedAt: Date.now(),
  es: {
    title: title.value,
    ingredientNames: ingredientNames.value,
    steps: stepTexts.value,
  },
}));
</script>
