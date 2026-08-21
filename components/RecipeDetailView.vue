<template>
  <article class="container mx-auto max-w-2xl px-4 py-10">
    <NuxtLinkLocale to="/" class="text-sm text-stone-500 transition hover:text-kale">← {{ t('recipe.back') }}</NuxtLinkLocale>

    <img v-if="recipe.image" :src="recipe.image" :alt="title" class="mt-4 aspect-[16/9] w-full rounded-2xl object-cover" >
    <div class="mt-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-kale sm:text-4xl">{{ title }}</h1>
        <p class="num mt-2 text-sm text-stone-600">
          {{ t('recipe.readyIn', { minutes: recipe.readyInMinutes }) }} &middot; {{ t('recipe.servings', { count: recipe.servings }) }}
        </p>
      </div>
      <FavoriteButton :recipe="favoritePayload" />
    </div>

    <h2 class="mt-10 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">{{ t('recipe.ingredients') }}</h2>
    <ul class="mt-4 space-y-2">
      <li v-for="(ing, i) in recipe.ingredients" :key="ing.id" class="flex items-baseline gap-2 text-kale">
        <span class="num font-medium text-kale">{{ formatMeasure(ing) }}</span>
        <span>{{ ingredientNames[i] ?? ing.name }}</span>
      </li>
    </ul>

    <h2 class="mt-10 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">{{ t('recipe.instructions') }}</h2>
    <p
      v-if="recipe.steps.length && unitSystem === 'metric'"
      class="mt-2 text-xs text-stone-500"
    >
      {{ t('recipe.stepsNote') }}
    </p>
    <p v-if="recipe.steps.length === 0" class="mt-3 text-stone-500">{{ t('recipe.noInstructions') }}</p>
    <ol v-else class="mt-4 space-y-4">
      <li v-for="(s, i) in recipe.steps" :key="s.number" class="flex gap-3 text-kale">
        <span class="num flex h-6 w-6 flex-none items-center justify-center rounded-full bg-basil text-xs font-semibold text-chalk">{{ i + 1 }}</span>
        <span class="pt-0.5">{{ stepTexts[i] ?? s.step }}</span>
      </li>
    </ol>
  </article>
</template>

<script setup lang="ts">
import type { RecipeDetail, RecipeIngredient, FavoriteRecipe } from '~/types/recipe';

const props = defineProps<{ recipe: RecipeDetail }>();
const { t, tm, rt } = useI18n();
const { unitSystem } = useUnitSystem();
const { translate } = useTranslate();

const title = ref(props.recipe.title);
const ingredientNames = ref<string[]>(props.recipe.ingredients.map((i) => i.name));
const stepTexts = ref<string[]>(props.recipe.steps.map((s) => s.step));

watchEffect(async () => {
  title.value = (await translate([props.recipe.title]))[0];
});
watchEffect(async () => {
  ingredientNames.value = await translate(props.recipe.ingredients.map((i) => i.name));
});
watchEffect(async () => {
  stepTexts.value = await translate(props.recipe.steps.map((s) => s.step));
});

function unitWord(word: string): string {
  const words = tm('units.words') as Record<string, unknown>;
  return words && word in words ? rt(words[word] as string) : word;
}
// Round to increments a cook actually uses — never centigram precision.
function prettyAmount(amount: number, unitShort: string): string {
  if (Number.isInteger(amount)) return String(amount);
  const u = unitShort.toLowerCase();
  const bulkMetric = ['g', 'ml', 'gram', 'grams', 'milliliter', 'milliliters'].includes(u);
  if (bulkMetric) {
    if (amount >= 100) return String(Math.round(amount / 5) * 5); // nearest 5 g/ml
    if (amount >= 10) return String(Math.round(amount)); // whole g/ml
    return String(Math.round(amount * 10) / 10); // one decimal for tiny amounts
  }
  // cups / tbsp / tsp / oz / lb / counts: at most one decimal
  return String(Math.round(amount * 10) / 10);
}
function formatMeasure(ing: RecipeIngredient): string {
  const m = unitSystem.value === 'metric' ? ing.metric : ing.us;
  const amount = prettyAmount(m.amount, m.unitShort);
  const unit = unitWord(m.unitLong) || m.unitShort;
  return `${amount} ${unit}`.trim();
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
