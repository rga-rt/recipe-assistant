import { describe, it, expect } from 'vitest';
import { matchCatalog, normalizeIngredient } from '~/utils/catalogMatch';

describe('normalizeIngredient', () => {
  it('trims, lowercases, strips accents and collapses spaces', () => {
    expect(normalizeIngredient('  Chile   Poblano ')).toBe('chile poblano');
    expect(normalizeIngredient('Champiñón')).toBe('champinon');
  });
});

describe('matchCatalog', () => {
  it('matches Spanish labels regardless of padding and case', () => {
    expect(matchCatalog('  Jitomate ')?.token).toBe('tomato');
  });
  it('matches English labels case-insensitively', () => {
    expect(matchCatalog('TOMATO')?.token).toBe('tomato');
  });
  it('matches without accents', () => {
    expect(matchCatalog('champinon')?.token).toBe('mushroom');
  });
  it('returns null for unknown ingredients', () => {
    expect(matchCatalog('nopal')).toBeNull();
  });
});
