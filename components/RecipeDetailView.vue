<template>
  <article class="container mx-auto max-w-2xl px-4 py-8">
    <NuxtLinkLocale to="/" class="text-sm text-gray-500 hover:underline">← {{ t('recipe.back') }}</NuxtLinkLocale>

    <img v-if="recipe.image" :src="recipe.image" :alt="title" class="mt-4 h-56 w-full rounded-xl object-cover" >
    <div class="mt-4 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ t('recipe.readyIn', { minutes: recipe.readyInMinutes }) }} · {{ t('recipe.servings', { count: recipe.servings }) }}
        </p>
      </div>
      <FavoriteButton :recipe="favoritePayload" />
    </div>

    <h2 class="mt-8 text-xl font-semibold text-gray-900">{{ t('recipe.ingredients') }}</h2>
    <ul class="mt-3 space-y-1">
      <li v-for="(ing, i) in recipe.ingredients" :key="ing.id" class="text-gray-700">
        <span class="font-medium">{{ formatMeasure(ing) }}</span> {{ ingredientNames[i] ?? ing.name }}
      </li>
    </ul>

    <h2 class="mt-8 text-xl font-semibold text-gray-900">{{ t('recipe.instructions') }}</h2>
    <p v-if="recipe.steps.length === 0" class="mt-3 text-gray-500">{{ t('recipe.noInstructions') }}</p>
    <ol v-else class="mt-3 list-decimal space-y-3 pl-5">
      <li v-for="(s, i) in recipe.steps" :key="s.number" class="text-gray-700">{{ stepTexts[i] ?? s.step }}</li>
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
function formatMeasure(ing: RecipeIngredient): string {
  const m = unitSystem.value === 'metric' ? ing.metric : ing.us;
  const amount = Number.isInteger(m.amount) ? String(m.amount) : m.amount.toFixed(2).replace(/\.?0+$/, '');
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
