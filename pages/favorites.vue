<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900">{{ t('favorites.title') }}</h1>
    <p v-if="ready && favorites.length === 0" class="mt-4 text-gray-500">{{ t('favorites.empty') }}</p>
    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLinkLocale
        v-for="fav in favorites"
        :key="fav.id"
        :to="`/recipe/${fav.id}`"
        class="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md"
      >
        <img v-if="fav.image" :src="fav.image" :alt="displayTitle(fav)" class="h-40 w-full object-cover" >
        <div class="p-4"><h3 class="font-semibold text-gray-900">{{ displayTitle(fav) }}</h3></div>
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FavoriteRecipe } from '~/types/recipe';

const { t, locale } = useI18n();
const { favorites, ready, refresh } = useFavorites();
onMounted(refresh);
function displayTitle(fav: FavoriteRecipe): string {
  return locale.value === 'es' && fav.es?.title ? fav.es.title : fav.title;
}
</script>
