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
  // The recipe payload from the detail page is a Vue reactive object, which
  // IndexedDB's structured-clone step rejects with DataCloneError. Round-trip
  // through JSON to store a plain, clone-safe copy of this pure-data record.
  const plain = JSON.parse(JSON.stringify(recipe)) as FavoriteRecipe;
  await (await db()).put(STORE, plain);
}
export async function dbDelete(id: number): Promise<void> {
  await (await db()).delete(STORE, id);
}
