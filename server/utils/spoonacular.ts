/* eslint-disable @typescript-eslint/no-explicit-any -- mappers normalize untyped upstream Spoonacular JSON */
import type { RecipeSummary, RecipeDetail, Measure, RecipeSearchPage } from '~/types/recipe';

const BASE = 'https://api.spoonacular.com';

export function mapSummary(raw: any): RecipeSummary {
  return {
    id: raw.id,
    title: raw.title,
    image: raw.image ?? '',
    usedCount: raw.usedIngredientCount ?? 0,
    missedCount: raw.missedIngredientCount ?? 0,
  };
}

function measure(m: any): Measure {
  return { amount: m?.amount ?? 0, unitShort: m?.unitShort ?? '', unitLong: m?.unitLong ?? '' };
}

export function mapDetail(raw: any): RecipeDetail {
  const steps = raw.analyzedInstructions?.[0]?.steps ?? [];
  return {
    id: raw.id,
    title: raw.title,
    image: raw.image ?? '',
    readyInMinutes: raw.readyInMinutes ?? 0,
    servings: raw.servings ?? 0,
    ingredients: (raw.extendedIngredients ?? []).map((i: any) => ({
      id: i.id,
      name: i.name ?? i.originalName ?? '',
      us: measure(i.measures?.us),
      metric: measure(i.measures?.metric),
    })),
    steps: steps.map((s: any) => ({ number: s.number, step: s.step })),
  };
}

export const BATCH_SIZE = 100;

export async function searchRecipes(opts: {
  ingredients: string[];
  cuisine?: string;
  offset: number;
  apiKey: string;
}): Promise<RecipeSearchPage> {
  const base: Record<string, unknown> = {
    includeIngredients: opts.ingredients.join(','),
    ...(opts.cuisine ? { cuisine: opts.cuisine } : {}),
    sort: 'max-used-ingredients',
    fillIngredients: true,
    ignorePantry: true,
    number: BATCH_SIZE,
    offset: opts.offset,
    apiKey: opts.apiKey,
  };
  const call = (query: Record<string, unknown>) =>
    $fetch<any>(`${BASE}/recipes/complexSearch`, { query });

  let data = await call(base);
  // Spoonacular quirk: some small cuisine queries return nothing when sorted
  // by max-used-ingredients but do return matches unsorted.
  if (opts.offset === 0 && !(data?.results?.length)) {
    const { sort: _sort, ...unsorted } = base;
    void _sort;
    data = await call(unsorted);
  }
  return {
    total: data?.totalResults ?? 0,
    recipes: (data?.results ?? []).map(mapSummary),
  };
}

export async function autocompleteIngredient(query: string, apiKey: string): Promise<string | null> {
  const data = await $fetch<any[]>(`${BASE}/food/ingredients/autocomplete`, {
    query: { query, number: 1, apiKey },
  });
  return data?.[0]?.name ?? null;
}

export async function getRecipe(id: number, apiKey: string): Promise<RecipeDetail> {
  const data = await $fetch<any>(`${BASE}/recipes/${id}/information`, {
    query: { includeNutrition: false, apiKey },
  });
  return mapDetail(data);
}
