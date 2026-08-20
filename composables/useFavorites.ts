import type { FavoriteRecipe } from '~/types/recipe';
import { dbGetAll, dbPut, dbDelete } from '~/utils/favoritesDb';

export function useFavorites() {
  const favorites = useState<FavoriteRecipe[]>('favorites', () => []);
  const ready = useState<boolean>('favorites-ready', () => false);

  async function refresh() {
    if (!import.meta.client) return;
    favorites.value = (await dbGetAll()).sort((a, b) => b.savedAt - a.savedAt);
    ready.value = true;
  }
  const isFavorite = (id: number) => favorites.value.some((r) => r.id === id);
  async function add(recipe: FavoriteRecipe) {
    await dbPut(recipe);
    if (!isFavorite(recipe.id)) favorites.value = [recipe, ...favorites.value];
  }
  async function remove(id: number) {
    await dbDelete(id);
    favorites.value = favorites.value.filter((r) => r.id !== id);
  }

  return { favorites, ready, isFavorite, add, remove, refresh };
}
