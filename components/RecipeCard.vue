<template>
  <NuxtLinkLocale
    :to="`/recipe/${recipe.id}`"
    class="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
  >
    <img v-if="recipe.image" :src="recipe.image" :alt="displayTitle" class="h-40 w-full object-cover" >
    <div class="p-4">
      <h3 class="font-semibold text-gray-900">{{ displayTitle }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ t('results.usesCount', { used: recipe.usedCount }) }}</p>
      <p v-if="recipe.missedCount > 0" class="text-sm text-amber-600">
        {{ t('results.missingCount', { count: recipe.missedCount }) }}
      </p>
    </div>
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
import type { RecipeSummary } from '~/types/recipe';

const props = defineProps<{ recipe: RecipeSummary; title?: string }>();
const { t } = useI18n();
const displayTitle = computed(() => props.title ?? props.recipe.title);
</script>
