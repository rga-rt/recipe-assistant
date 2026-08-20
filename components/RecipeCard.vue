<template>
  <NuxtLinkLocale
    :to="`/recipe/${recipe.id}`"
    class="block overflow-hidden rounded-2xl bg-chalk shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
  >
    <img v-if="recipe.image" :src="recipe.image" :alt="displayTitle" class="aspect-[4/3] w-full rounded-t-2xl object-cover" >
    <div class="p-4">
      <h3 class="font-display font-semibold text-kale">{{ displayTitle }}</h3>
      <p class="mt-2 text-sm text-stone-600">
        <span class="num inline-flex items-center rounded-full bg-saffron-soft px-2 py-0.5 text-xs font-semibold text-kale">
          {{ t('results.usesCount', { used: recipe.usedCount }) }}
        </span>
      </p>
      <p v-if="recipe.missedCount > 0" class="mt-1.5 text-sm text-stone-500">
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
