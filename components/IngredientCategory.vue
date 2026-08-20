<template>
  <section class="mb-6">
    <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
      {{ t(`categories.${category.id}`) }}
    </h3>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="ing in category.ingredients"
        :key="ing.token"
        :data-test="`ingredient-${ing.token}`"
        class="rounded-full border px-3 py-1.5 text-sm transition"
        :class="isSelected(ing.token)
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'"
        @click="toggle(ing.token)"
      >
        {{ locale === 'es' ? ing.es : ing.en }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { IngredientCategory } from '~/types/recipe';

defineProps<{ category: IngredientCategory }>();
const { t, locale } = useI18n();
const { isSelected, toggle } = useRecipeFinder();
</script>
