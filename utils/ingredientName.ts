// Spoonacular ingredient names arrive dirty ("slc fat bacon cut") and the
// MyMemory translation memory sometimes returns artifacts — a spurious leading
// number word or a trailing period ("garlic cloves" -> "Dos dientes de ajo.").
// These two helpers clean the name going in and the translation coming out.
// Both are intentionally conservative: they only touch clear artifacts so
// legitimate names/translations pass through unchanged.

// Leading tokens that are unit/prep abbreviations, not part of the food name.
const LEADING_ABBREVIATIONS = new Set(['slc', 'pkg', 'lg', 'sm', 'med', 'pc', 'pcs']);

/** Capitalize the first letter, leaving the rest untouched. No-op on empty input. */
export function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Strip leading unit/prep abbreviations from a raw Spoonacular ingredient name. */
export function cleanIngredientName(name: string): string {
  let tokens = name.trim().split(/\s+/);
  while (tokens.length > 1 && LEADING_ABBREVIATIONS.has(tokens[0].toLowerCase().replace(/\.$/, ''))) {
    tokens = tokens.slice(1);
  }
  return tokens.join(' ');
}

// Spanish cardinal number words MyMemory may prepend from translation-memory
// context (e.g. a segment originally phrased "Two garlic cloves").
const ES_NUMBER_WORDS = new Set([
  'un', 'uno', 'una', 'unos', 'unas', 'dos', 'tres', 'cuatro', 'cinco',
  'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce',
]);

/**
 * Clean a translated ingredient name: drop a trailing period, and drop a
 * leading number word ONLY when the source text didn't start with a number
 * (so a genuine "2 eggs" -> "Dos huevos" is preserved).
 */
export function sanitizeTranslatedName(source: string, translated: string): string {
  let out = translated.trim().replace(/\.+$/, '').trim();
  const sourceStartsWithNumber = /^\s*\d/.test(source);
  if (!sourceStartsWithNumber) {
    const match = out.match(/^(\S+)\s+(.+)$/);
    if (match && ES_NUMBER_WORDS.has(match[1].toLowerCase())) out = match[2];
  }
  return out;
}
