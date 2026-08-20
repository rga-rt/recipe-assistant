/* eslint-disable @typescript-eslint/no-explicit-any -- mappers normalize untyped upstream Spoonacular JSON */
import type { RecipeSummary, RecipeDetail, Measure } from '~/types/recipe';

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

export async function findByIngredients(ingredients: string[], apiKey: string): Promise<RecipeSummary[]> {
  const data = await $fetch<any[]>(`${BASE}/recipes/findByIngredients`, {
    query: { ingredients: ingredients.join(','), number: 8, ranking: 1, ignorePantry: true, apiKey },
  });
  return data.map(mapSummary);
}

export async function getRecipe(id: number, apiKey: string): Promise<RecipeDetail> {
  const data = await $fetch<any>(`${BASE}/recipes/${id}/information`, {
    query: { includeNutrition: false, apiKey },
  });
  return mapDetail(data);
}
