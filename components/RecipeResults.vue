<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">{{ t('results.title') }}</h2>
      <button class="text-sm font-medium text-gray-600 hover:underline" @click="goStart">
        {{ t('results.newSearch') }}
      </button>
    </div>

    <p v-if="pending" class="text-gray-500">{{ t('start.subtitle') }}</p>
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-red-700">
      <p>{{ error === 'quota' ? t('errors.quota') : t('errors.generic') }}</p>
      <button class="mt-2 text-sm font-semibold underline" @click="fetchRecipes">{{ t('errors.retry') }}</button>
    </div>
    <p v-else-if="results.length === 0" class="text-gray-500">{{ t('results.empty') }}</p>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
const { results, pending, error, goStart, fetchRecipes } = useRecipeFinder();
const { translate } = useTranslate();

const titles = ref<string[]>([]);
watchEffect(async () => {
  titles.value = await translate(results.value.map((r) => r.title));
});
</script>
