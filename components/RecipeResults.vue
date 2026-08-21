<template>
  <div class="container mx-auto px-4 py-10">
    <div class="mb-8 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-kale sm:text-3xl">{{ t('results.title') }}</h2>
      <button class="rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100" @click="goSelect">
        {{ t('results.newSearch') }}
      </button>
    </div>

    <div v-if="pending">
      <p class="mb-5 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
        {{ t('results.loading') }}
      </p>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        <div
          v-for="n in 8"
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
      <p class="text-stone-600">{{ t('results.empty') }}</p>
    </div>
    <div v-else class="grid animate-fade-rise gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <RecipeCard
        v-for="(r, i) in results"
        :key="r.id"
        :recipe="r"
        :title="titles[i]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { results, pending, error, goSelect, fetchRecipes } = useRecipeFinder();
const { translate } = useTranslate();

const titles = ref<string[]>([]);
watchEffect(async () => {
  titles.value = await translate(results.value.map((r) => r.title));
});
</script>
