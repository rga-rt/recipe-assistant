import type { RecipeSummary } from '~/types/recipe';
import { rankPages } from '~/utils/recipePaging';

export const RECIPE_SORTS = ['best', 'fewest-missing', 'quickest', 'popular', 'healthiest'] as const;
export type RecipeSort = (typeof RECIPE_SORTS)[number];

// Unknown values (missing from Spoonacular) always sort last.
const asc = (v?: number) => (v && v > 0 ? v : Number.POSITIVE_INFINITY);
const desc = (v?: number) => (v && v > 0 ? -v : Number.POSITIVE_INFINITY);

const comparators: Record<Exclude<RecipeSort, 'best'>, (a: RecipeSummary, b: RecipeSummary) => number> = {
  'fewest-missing': (a, b) => a.missedCount - b.missedCount || b.usedCount - a.usedCount,
  quickest: (a, b) => asc(a.readyInMinutes) - asc(b.readyInMinutes),
  popular: (a, b) => desc(a.likes) - desc(b.likes),
  healthiest: (a, b) => desc(a.healthScore) - desc(b.healthScore),
};

// Sorts the recipes already loaded on the device. "best" keeps the shuffled,
// per-page ranking so "Show more" never reorders what was already seen.
export function sortRecipes(recipes: RecipeSummary[], sort: RecipeSort): RecipeSummary[] {
  if (sort === 'best') return rankPages(recipes);
  return [...recipes].sort(comparators[sort]);
}
