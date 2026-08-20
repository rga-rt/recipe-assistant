<template>
  <article
    class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
  >
    <div class="flex items-start justify-between gap-4">
      <h3 class="text-xl font-semibold text-gray-900">{{ recipe.title }}</h3>
      <span class="whitespace-nowrap text-sm text-gray-500">
        {{ recipe.minutes }} {{ t('recipes.minutes') }}
      </span>
    </div>
    <p class="mt-2 text-gray-600">{{ recipe.description }}</p>
    <ul class="mt-4 flex flex-wrap gap-2">
      <li
        v-for="tag in recipe.tags"
        :key="tag"
        class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
      >
        {{ tag }}
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types/recipe';

defineProps<{
  recipe: Recipe;
}>();

const { t } = useI18n();
</script>
