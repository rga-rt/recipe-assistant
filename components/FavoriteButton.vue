<template>
  <button
    class="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition"
    :class="active ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100'"
    :aria-pressed="active"
    @click="onClick"
  >
    <span aria-hidden="true">{{ active ? '♥' : '♡' }}</span>
    {{ active ? t('favorites.remove') : t('favorites.add') }}
  </button>
</template>

<script setup lang="ts">
import type { FavoriteRecipe } from '~/types/recipe';

const props = defineProps<{ recipe: FavoriteRecipe }>();
const { t } = useI18n();
const { isFavorite, add, remove, refresh } = useFavorites();
onMounted(refresh);
const active = computed(() => isFavorite(props.recipe.id));
async function onClick() {
  if (active.value) await remove(props.recipe.id);
  else await add({ ...props.recipe, savedAt: Date.now() });
}
</script>
