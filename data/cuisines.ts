// Spoonacular's supported cuisine values (lowercase, as sent in the `cuisine` query param).
export const CUISINES = [
  'african',
  'american',
  'asian',
  'british',
  'cajun',
  'caribbean',
  'chinese',
  'eastern european',
  'european',
  'french',
  'german',
  'greek',
  'indian',
  'irish',
  'italian',
  'japanese',
  'jewish',
  'korean',
  'latin american',
  'mediterranean',
  'mexican',
  'middle eastern',
  'nordic',
  'southern',
  'spanish',
  'thai',
  'vietnamese',
] as const;

export type Cuisine = (typeof CUISINES)[number];

export function isCuisine(value: string): value is Cuisine {
  return (CUISINES as readonly string[]).includes(value);
}
