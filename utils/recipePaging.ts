import type { RecipeSummary } from '~/types/recipe';

export const PAGE_SIZE = 24;

// Splits recipes into consecutive pages and ranks each page on its own
// (fewest missing ingredients, then most used), so a "Show more" never
// reorders recipes the user has already seen.
export function rankPages(recipes: RecipeSummary[], pageSize = PAGE_SIZE): RecipeSummary[] {
  const out: RecipeSummary[] = [];
  for (let i = 0; i < recipes.length; i += pageSize) {
    const page = recipes
      .slice(i, i + pageSize)
      .sort((a, b) => a.missedCount - b.missedCount || b.usedCount - a.usedCount);
    out.push(...page);
  }
  return out;
}
