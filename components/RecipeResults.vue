<template>
  <div class="container mx-auto px-4 py-10">
    <div class="mb-8">
      <div class="flex items-start justify-between gap-3">
        <h2 class="text-2xl font-bold text-kale sm:text-3xl">{{ t('results.title') }}</h2>
        <button class="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100" @click="goSelect">
          {{ t('results.newSearch') }}
        </button>
      </div>
      <div v-if="!pending && !error && results.length" class="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p class="num text-sm text-stone-500" data-test="results-count">
          {{ t('results.count', { count: total.toLocaleString(locale) }, total) }}
        </p>
        <label class="flex items-center gap-2 text-sm text-stone-600">
          <span class="whitespace-nowrap">{{ t('sort.label') }}</span>
          <span class="relative inline-flex">
            <select
              v-model="sort"
              data-test="sort-select"
              class="appearance-none rounded-full border border-stone-300 bg-chalk py-1.5 pl-3.5 pr-9 text-sm font-medium text-kale transition hover:border-basil focus:border-basil focus:outline-none"
            >
              <option v-for="s in RECIPE_SORTS" :key="s" :value="s">{{ t(`sort.options.${s}`) }}</option>
            </select>
            <!-- Custom chevron replaces the browser's native arrow. -->
            <svg
              data-test="sort-chevron"
              class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-basil"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </label>
      </div>
    </div>

    <div v-if="pending">
      <p class="mb-5 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
        {{ t('results.loading') }}
      </p>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        <div
          v-for="n in 24"
          :key="n"
          class="overflow-hidden rounded-2xl border border-stone-200 bg-chalk shadow-card"
        >
          <div class="aspect-[4/3] w-full animate-pulse bg-stone-100"></div>
          <div class="space-y-2 p-4">
            <div class="h-4 w-3/4 animate-pulse rounded bg-stone-100"></div>
            <div class="h-3 w-1/2 animate-pulse rounded bg-stone-100"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="mx-auto max-w-md rounded-2xl border border-tomato/20 bg-tomato/5 p-6 text-center">
      <p class="text-kale">{{ error === 'quota' ? t('errors.quota') : t('errors.generic') }}</p>
      <button class="mt-3 rounded-full bg-tomato px-4 py-2 text-sm font-semibold text-chalk transition hover:opacity-90" @click="fetchRecipes">
        {{ t('errors.retry') }}
      </button>
    </div>
    <div v-else-if="results.length === 0" class="mx-auto max-w-md rounded-2xl border border-stone-200 bg-chalk p-8 text-center shadow-card">
      <template v-if="cuisine">
        <p class="text-stone-600">{{ t('results.emptyCuisine', { cuisine: cuisineLabel }) }}</p>
        <button
          data-test="try-all"
          class="mt-4 rounded-full bg-basil px-5 py-2 text-sm font-semibold text-chalk shadow-card transition hover:bg-basil-600"
          @click="searchAllCuisines"
        >
          {{ t('results.tryAll') }}
        </button>
      </template>
      <p v-else class="text-stone-600">{{ t('results.empty') }}</p>
    </div>
    <template v-else>
      <div class="grid animate-fade-rise gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <RecipeCard
          v-for="(r, i) in visible"
          :key="r.id"
          :recipe="r"
          :title="titles[i]"
          :detail="detailFor(r)"
        />
      </div>
      <div v-if="hasMore" class="mt-10 flex flex-col items-center gap-3">
        <p v-if="loadMoreError" data-test="load-more-error" class="text-sm text-tomato" role="status">
          {{ loadMoreError === 'quota' ? t('errors.quota') : t('errors.generic') }}
        </p>
        <button
          data-test="show-more"
          class="rounded-full border border-basil px-6 py-2.5 text-sm font-semibold text-basil transition hover:bg-basil hover:text-chalk disabled:cursor-wait disabled:opacity-60"
          :disabled="loadingMore"
          @click="showMore"
        >
          {{ loadingMore ? t('results.loading') : t('results.showMore') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { RECIPE_SORTS } from '~/utils/recipeSort';
import type { RecipeSummary } from '~/types/recipe';

const { t, locale } = useI18n();
const {
  sort, results, visible, total, hasMore, pending, loadingMore, error, loadMoreError, cuisine,
  goSelect, fetchRecipes, showMore, searchAllCuisines,
} = useRecipeFinder();
const cuisineLabel = computed(() =>
  cuisine.value ? t(`cuisine.options.${cuisine.value.replace(/ /g, '_')}`) : '',
);
// The card shows the value the active sort is ranking by, so the order makes sense.
function detailFor(r: RecipeSummary): string | undefined {
  if (sort.value === 'quickest' && r.readyInMinutes) return t('sort.detail.quickest', { minutes: r.readyInMinutes });
  if (sort.value === 'popular' && r.likes) return t('sort.detail.popular', { count: r.likes.toLocaleString(locale.value) });
  if (sort.value === 'healthiest' && r.healthScore) return t('sort.detail.healthiest', { score: Math.round(r.healthScore) });
  return undefined;
}

const { translate } = useTranslate();

const titles = ref<string[]>([]);
watchEffect(async () => {
  // Only visible cards are translated, so loading a 100-recipe batch doesn't
  // send 100 titles to the translation service.
  titles.value = await translate(visible.value.map((r) => r.title));
});
</script>
