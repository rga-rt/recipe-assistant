import { openDB, type IDBPDatabase } from 'idb';
import type { FavoriteRecipe } from '~/types/recipe';

const DB_NAME = 'recipe-assistant';
const STORE = 'favorites';

let dbPromise: Promise<IDBPDatabase> | null = null;
function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE)) {
          database.createObjectStore(STORE, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function dbGetAll(): Promise<FavoriteRecipe[]> {
  return (await db()).getAll(STORE);
}
export async function dbPut(recipe: FavoriteRecipe): Promise<void> {
  await (await db()).put(STORE, recipe);
}
export async function dbDelete(id: number): Promise<void> {
  await (await db()).delete(STORE, id);
}
