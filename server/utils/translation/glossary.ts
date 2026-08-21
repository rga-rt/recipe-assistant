// Corrections for culinary terms that generic machine translation gets wrong.
// Applied to Spanish output so the fix reaches both the response and the cache
// consumers. Idempotent — re-applying to already-fixed text is a no-op.
const REPLACEMENTS: Array<[RegExp, string]> = [
  [/gasa de albahaca/gi, 'albahaca en chiffonade'],
  // Consume an optional preceding "en" so we don't produce "en en chiffonade".
  [/\b(?:en\s+)?chiffonade\b/gi, 'en chiffonade'],
];

export function fixCulinary(text: string): string {
  let out = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  // Strip machine-translation disambiguation tags that leak into names,
  // e.g. "feta de queso (sustancia)".
  out = out.replace(/\s*\((?:sustancia|substance)\)/gi, '');
  // Safety net: collapse any accidental duplicated preposition.
  return out.replace(/\ben\s+en\b/gi, 'en');
}
