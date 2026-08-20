<template>
  <button
    class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-95"
    :class="active ? 'border-tomato bg-tomato/10 text-tomato' : 'border-stone-300 text-stone-600 hover:border-tomato hover:text-tomato'"
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
