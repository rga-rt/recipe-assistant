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
        <div class="flex items-center justify-between gap-4">
          <span class="num text-sm font-medium text-kale">{{
            t('select.selectedCount', { count: selected.length }, selected.length)
          }}</span>
          <div class="flex items-center gap-2">
            <label class="sr-only" for="cuisine-select">{{ t('cuisine.label') }}</label>
            <select
              id="cuisine-select"
              v-model="cuisineModel"
              data-test="cuisine-select"
              class="max-w-[9.5rem] rounded-full border border-stone-300 bg-chalk px-3 py-2 text-sm text-kale transition focus:border-basil focus:outline-none sm:max-w-none"
            >
              <option value="">{{ t('cuisine.all') }}</option>
              <option v-for="c in cuisineOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
            <button
              class="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
              @click="clear"
            >
              {{ t('select.clear') }}
            </button>
            <button
              data-test="get-recipes"
              class="rounded-full bg-basil px-5 py-2 text-sm font-semibold text-chalk shadow-card transition hover:bg-basil-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-basil disabled:hover:shadow-card"
              :disabled="selected.length === 0 || pending"
              @click="fetchRecipes"
            >
              {{ t('select.getRecipes') }}
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

// '' in the <select> means All (stored as null).
const cuisineModel = computed({
  get: () => cuisine.value ?? '',
  set: (v: string) => { cuisine.value = v || null; },
});
const cuisineOptions = computed(() =>
  CUISINES.map((value) => ({ value, label: t(`cuisine.options.${value.replace(/ /g, '_')}`) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale.value)),
);

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
