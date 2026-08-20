<template>
  <div>
    <div v-if="pending" class="container mx-auto px-4 py-8 text-gray-500">{{ t('start.subtitle') }}</div>
    <div v-else-if="error || !recipe" class="container mx-auto px-4 py-8">
      <p class="text-red-600">{{ t('errors.generic') }}</p>
      <NuxtLinkLocale to="/" class="mt-2 inline-block text-sm underline">{{ t('recipe.back') }}</NuxtLinkLocale>
    </div>
    <RecipeDetailView v-else :recipe="recipe" />
  </div>
</template>

<script setup lang="ts">
import type { RecipeDetail } from '~/types/recipe';

const { t } = useI18n();
const route = useRoute();
const { data: recipe, pending, error } = await useFetch<RecipeDetail>(`/api/recipes/${route.params.id}`);
</script>
