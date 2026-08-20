export interface CatalogIngredient { token: string; en: string; es: string }
export interface IngredientCategory { id: string; ingredients: CatalogIngredient[] }
export interface RecipeSummary { id: number; title: string; image: string; usedCount: number; missedCount: number }
export interface Measure { amount: number; unitShort: string; unitLong: string }
export interface RecipeIngredient { id: number; name: string; us: Measure; metric: Measure }
export interface RecipeStep { number: number; step: string }
export interface RecipeDetail { id: number; title: string; image: string; readyInMinutes: number; servings: number; ingredients: RecipeIngredient[]; steps: RecipeStep[] }
export interface RecipeTranslation { title: string; ingredientNames: string[]; steps: string[] }
export interface FavoriteRecipe extends RecipeDetail { savedAt: number; es?: RecipeTranslation }
