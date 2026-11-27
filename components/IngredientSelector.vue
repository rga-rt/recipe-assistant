<template>
  <div class="container mx-auto px-4 py-10 pb-40">
    <h2 class="text-2xl font-bold text-kale sm:text-3xl">{{ t('select.title') }}</h2>
    <p class="mt-2 text-stone-600">{{ t('select.hint') }}</p>
    <p class="mt-1 text-sm text-stone-500">{{ t('select.tip') }}</p>

    <div class="mt-6 max-w-md">
      <input
        v-model="query"
        type="search"
        :placeholder="t('select.search')"
        class="w-full rounded-full border border-stone-300 bg-chalk px-4 py-2.5 text-sm text-kale transition placeholder:text-stone-400 focus:border-basil focus:outline-none"
        @keydown.enter.prevent="addTyped"
      >
      <button
        v-if="canAdd"
        data-test="add-custom"
        class="mt-2 inline-flex items-center gap-2 rounded-full border border-basil px-4 py-1.5 text-sm font-medium text-basil transition hover:bg-basil hover:text-chalk disabled:cursor-wait disabled:opacity-60"
        :disabled="adding"
        @click="addTyped"
      >
        <span v-if="adding" aria-hidden="true" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
        {{ t('select.add', { name: query.trim() }) }}
      </button>
      <p v-if="addMessage" class="mt-2 text-sm text-tomato" role="status">{{ addMessage }}</p>
    </div>

    <section class="mt-8">
      <h3 id="cuisine-heading" class="mb-3 flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
        {{ t('cuisine.label') }}
        <span class="h-px flex-1 bg-stone-200" aria-hidden="true"></span>
      </h3>
      <!-- One swipeable row on phones (keeps ingredients on the first screen); wraps from sm up. -->
      <div
        ref="cuisineRow"
        role="radiogroup"
        aria-labelledby="cuisine-heading"
        class="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
      >
        <button
          v-for="c in cuisinePills"
          :key="c.value || 'all'"
          role="radio"
          :aria-checked="cuisine === c.value"
          :data-test="`cuisine-${c.value ? c.value.replace(/ /g, '-') : 'all'}`"
          class="chip shrink-0 snap-start whitespace-nowrap"
          :class="cuisine === c.value
            ? 'border-basil bg-basil text-chalk shadow-sm'
            : 'border-stone-300 bg-chalk text-kale hover:border-basil'"
          @click="cuisine = c.value"
        >
          {{ c.label }}
        </button>
      </div>
    </section>

    <div class="mt-6">
      <IngredientCategory
        v-for="cat in filteredCategories"
        :key="cat.id"
        :category="cat"
      />
      <p v-if="filteredCategories.length === 0" class="text-stone-500">
        {{ t('select.noMatches') }}
      </p>
    </div>

    <div
      class="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-chalk/95 shadow-lift backdrop-blur"
    >
      <div class="container mx-auto px-4 py-3">
        <div
          v-if="selected.length"
          class="mb-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto"
        >
          <button
            v-for="tok in selected"
            :key="tok"
            class="chip border-saffron bg-saffron-soft py-1 text-xs text-kale"
            @click="toggle(tok)"
          >
            {{ labelFor(tok) }}
            <span aria-hidden="true" class="ml-0.5 text-stone-500">×</span>
          </button>
        </div>
        <div class="flex items-center justify-between gap-3">
          <!-- On phones the chips above already show the selection; the count moves into the button. -->
          <span class="num hidden whitespace-nowrap text-sm font-medium text-kale sm:inline">{{
            t('select.selectedCount', { count: selected.length }, selected.length)
          }}</span>
          <div class="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <button
              class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
              @click="clear"
            >
              {{ t('select.clear') }}
            </button>
            <button
              data-test="get-recipes"
              class="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-basil px-5 py-2 text-sm font-semibold text-chalk shadow-card transition hover:bg-basil-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-basil disabled:hover:shadow-card"
              :disabled="selected.length === 0 || pending"
              @click="fetchRecipes"
            >
              {{ t('select.getRecipes') }}
              <span
                v-if="selected.length"
                class="num inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-chalk px-1.5 text-xs font-semibold text-basil sm:hidden"
                aria-hidden="true"
              >{{ selected.length }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { INGREDIENT_CATEGORIES } from '~/data/ingredients';
import { CUISINES } from '~/data/cuisines';
import { normalizeIngredient as norm, matchCatalog } from '~/utils/catalogMatch';
import type { CatalogIngredient } from '~/types/recipe';

const { t, locale } = useI18n();
const { selected, cuisine, customLabels, pending, clear, fetchRecipes, toggle, addCustom } = useRecipeFinder();

const query = ref('');
const adding = ref(false);
const addMessage = ref('');
watch(query, () => { addMessage.value = ''; });
const canAdd = computed(() => {
  const text = query.value.trim();
  return text.length > 0 && !matchCatalog(text);
});

async function addTyped() {
  if (!canAdd.value || adding.value) return;
  const name = query.value.trim();
  adding.value = true;
  const result = await addCustom(name, locale.value === 'es' ? 'es' : 'en');
  adding.value = false;
  if (result === 'added') {
    query.value = '';
    return;
  }
  addMessage.value =
    result === 'duplicate' ? t('select.alreadyAdded', { name })
    : result === 'not_found' ? t('select.notFound', { name })
    : result === 'quota' ? t('errors.quota')
    : t('errors.generic');
}

// Keep the chosen cuisine visible in the swipeable row (e.g. when coming back from results).
const cuisineRow = ref<HTMLElement | null>(null);
function revealCuisine() {
  const el = cuisineRow.value?.querySelector<HTMLElement>('[aria-checked="true"]');
  el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
}
onMounted(revealCuisine);
watch(cuisine, () => nextTick(revealCuisine));

// All first (null), then cuisines sorted by the current locale's label.
const cuisinePills = computed<{ value: string | null; label: string }[]>(() => [
  { value: null, label: t('cuisine.all') },
  ...CUISINES.map((value) => ({ value: value as string | null, label: t(`cuisine.options.${value.replace(/ /g, '_')}`) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale.value)),
]);

const filteredCategories = computed(() => {
  const q = norm(query.value.trim());
  if (!q) return INGREDIENT_CATEGORIES;
  return INGREDIENT_CATEGORIES.map((c) => ({
    ...c,
    ingredients: c.ingredients.filter(
      (i) => norm(i.en).includes(q) || norm(i.es).includes(q),
    ),
  })).filter((c) => c.ingredients.length > 0);
});

const labelMap: Record<string, CatalogIngredient> = Object.fromEntries(
  INGREDIENT_CATEGORIES.flatMap((c) => c.ingredients.map((i) => [i.token, i])),
);
function labelFor(token: string): string {
  const ing = labelMap[token];
  if (!ing) {
    const typed = customLabels.value[token];
    if (!typed || norm(typed) === norm(token)) return typed ?? token;
    return `${typed} → ${token}`;
  }
  return locale.value === 'es' ? ing.es : ing.en;
}
</script>
