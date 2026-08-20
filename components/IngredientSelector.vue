<template>
  <div class="container mx-auto px-4 py-10 pb-28">
    <h2 class="text-2xl font-bold text-kale sm:text-3xl">{{ t('select.title') }}</h2>
    <p class="mt-2 text-stone-600">{{ t('select.hint') }}</p>

    <div class="mt-8">
      <IngredientCategory v-for="cat in categories" :key="cat.id" :category="cat" />
    </div>

    <div class="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-chalk/95 shadow-lift backdrop-blur">
      <div class="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <span class="num text-sm font-medium text-kale">{{ t('select.selectedCount', { count: selected.length }) }}</span>
        <div class="flex gap-2">
          <button class="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100" @click="clear">
            {{ t('select.clear') }}
          </button>
          <button
            data-test="get-recipes"
            class="rounded-full bg-basil px-5 py-2 text-sm font-semibold text-chalk shadow-card transition hover:bg-basil-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-basil disabled:hover:shadow-card"
            :disabled="selected.length === 0 || pending"
            @click="fetchRecipes"
          >
            {{ t('select.getRecipes') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { INGREDIENT_CATEGORIES } from '~/data/ingredients';

const { t } = useI18n();
const { selected, pending, clear, fetchRecipes } = useRecipeFinder();
const categories = INGREDIENT_CATEGORIES;
</script>
