<template>
  <div>
    <div v-if="pending" class="container mx-auto flex flex-col items-center gap-2 px-4 py-16 text-center">
      <span class="font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">{{ t('recipe.loading') }}</span>
    </div>
    <div v-else-if="error || !recipe" class="container mx-auto px-4 py-10">
      <p class="text-kale">{{ t('errors.generic') }}</p>
      <NuxtLinkLocale to="/" class="mt-2 inline-block text-sm text-stone-500 underline hover:text-kale">{{ t('recipe.back') }}</NuxtLinkLocale>
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
