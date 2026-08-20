<template>
  <div class="container mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold text-kale sm:text-3xl">{{ t('favorites.title') }}</h1>
    <div v-if="ready && favorites.length === 0" class="mx-auto mt-8 max-w-md rounded-2xl border border-stone-200 bg-chalk p-8 text-center shadow-card">
      <p class="text-stone-600">{{ t('favorites.empty') }}</p>
    </div>
    <div v-else class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLinkLocale
        v-for="fav in favorites"
        :key="fav.id"
        :to="`/recipe/${fav.id}`"
        class="block overflow-hidden rounded-2xl bg-chalk shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
      >
        <img v-if="fav.image" :src="fav.image" :alt="displayTitle(fav)" class="aspect-[4/3] w-full rounded-t-2xl object-cover" >
        <div class="p-4"><h3 class="font-display font-semibold text-kale">{{ displayTitle(fav) }}</h3></div>
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
