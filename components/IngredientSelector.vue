<template>
  <div class="container mx-auto px-4 py-8 pb-28">
    <h2 class="text-2xl font-bold text-gray-900">{{ t('select.title') }}</h2>
    <p class="mt-1 text-gray-600">{{ t('select.hint') }}</p>

    <div class="mt-6">
      <IngredientCategory v-for="cat in categories" :key="cat.id" :category="cat" />
    </div>

    <div class="fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur">
      <div class="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <span class="text-sm text-gray-600">{{ t('select.selectedCount', { count: selected.length }) }}</span>
        <div class="flex gap-2">
          <button class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100" @click="clear">
            {{ t('select.clear') }}
          </button>
          <button
            data-test="get-recipes"
            class="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
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
