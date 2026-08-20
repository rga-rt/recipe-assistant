<template>
  <section class="mb-8">
    <h3 class="mb-3 flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
      {{ t(`categories.${category.id}`) }}
      <span class="h-px flex-1 bg-stone-200" aria-hidden="true"></span>
    </h3>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="ing in category.ingredients"
        :key="ing.token"
        :data-test="`ingredient-${ing.token}`"
        class="chip"
        :class="isSelected(ing.token)
          ? 'border-saffron bg-saffron-soft text-kale shadow-sm'
          : 'border-stone-300 bg-chalk text-kale hover:border-basil'"
        @click="toggle(ing.token)"
      >
        <span v-if="isSelected(ing.token)" aria-hidden="true">✓</span>
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
