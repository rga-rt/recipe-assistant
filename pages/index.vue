<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b bg-white">
      <div class="container mx-auto flex items-center justify-between px-4 py-4">
        <nav class="flex gap-4 text-sm font-medium text-gray-700">
          <span>{{ t('nav.home') }}</span>
          <span>{{ t('nav.recipes') }}</span>
          <span>{{ t('nav.about') }}</span>
        </nav>
        <LocaleSwitcher />
      </div>
    </header>

    <main class="container mx-auto px-4 py-12">
      <section class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900">{{ t('hero.title') }}</h1>
        <p class="mt-2 text-lg text-gray-600">{{ t('hero.subtitle') }}</p>
      </section>

      <section>
        <h2 class="mb-6 text-2xl font-bold text-gray-900">
          {{ t('recipes.title') }}
        </h2>

        <p v-if="pending" class="text-gray-500">{{ t('common.loading') }}</p>
        <p v-else-if="error" class="text-red-600">{{ t('common.error') }}</p>
        <p v-else-if="!recipes || recipes.length === 0" class="text-gray-500">
          {{ t('recipes.noRecipesYet') }}
        </p>
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types/recipe';

const { t } = useI18n();

const {
  data: recipes,
  pending,
  error,
} = await useFetch<Recipe[]>('/api/recipes');
</script>
