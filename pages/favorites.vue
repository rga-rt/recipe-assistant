<template>
  <div class="container mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold text-kale sm:text-3xl">{{ t('favorites.title') }}</h1>
    <div v-if="ready && favorites.length === 0" class="mx-auto mt-16 max-w-md rounded-2xl border border-stone-200 bg-chalk p-10 text-center shadow-card">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-tomato/10 text-tomato" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21s-7.5-4.9-10-9.4C.6 8.9 1.9 5.5 5 5.1c1.9-.2 3.5.8 4.5 2.2C10.5 5.9 12.1 4.9 14 5.1c3.1.4 4.4 3.8 3 6.5C19.5 16.1 12 21 12 21z"/>
        </svg>
      </div>
      <p class="text-stone-600">{{ t('favorites.empty') }}</p>
      <NuxtLinkLocale
        to="/"
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-basil px-6 py-3 text-sm font-semibold text-chalk shadow-card transition hover:bg-basil-600"
        @click="goStart"
      >
        {{ t('favorites.cta') }}
        <span aria-hidden="true">→</span>
      </NuxtLinkLocale>
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
const { goStart } = useRecipeFinder();
onMounted(refresh);
function displayTitle(fav: FavoriteRecipe): string {
  return locale.value === 'es' && fav.es?.title ? fav.es.title : fav.title;
}
</script>
