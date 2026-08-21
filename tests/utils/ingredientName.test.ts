import { describe, it, expect } from 'vitest';
import { cleanIngredientName, sanitizeTranslatedName } from '~/utils/ingredientName';

describe('cleanIngredientName (source cleaning)', () => {
  it('strips a leading unit/prep abbreviation from a dirty Spoonacular name', () => {
    expect(cleanIngredientName('slc fat bacon cut')).toBe('fat bacon cut');
    expect(cleanIngredientName('slc bread cut rounds')).toBe('bread cut rounds');
  });

  it('leaves a clean name untouched', () => {
    expect(cleanIngredientName('garlic cloves')).toBe('garlic cloves');
    expect(cleanIngredientName('red wine vinegar')).toBe('red wine vinegar');
  });

  it('never strips the only token, and collapses whitespace', () => {
    expect(cleanIngredientName('slc')).toBe('slc');
    expect(cleanIngredientName('  eggs   ')).toBe('eggs');
  });
});

describe('sanitizeTranslatedName (MT output cleaning)', () => {
  it('removes a spurious leading number-word MyMemory prepended', () => {
    // Real MyMemory result for "garlic cloves".
    expect(sanitizeTranslatedName('garlic cloves', 'Dos dientes de ajo.')).toBe('dientes de ajo');
  });

  it('strips a trailing period MyMemory appends', () => {
    expect(sanitizeTranslatedName('butter', 'mantequilla.')).toBe('mantequilla');
  });

  it('keeps a leading number word when the SOURCE actually had a number', () => {
    expect(sanitizeTranslatedName('2 eggs', 'Dos huevos')).toBe('Dos huevos');
  });

  it('does not touch a normal translation', () => {
    expect(sanitizeTranslatedName('olive oil', 'aceite de oliva')).toBe('aceite de oliva');
  });

  it('does not strip a real first word that only looks like the start of a phrase', () => {
    expect(sanitizeTranslatedName('shallots', 'chalotes')).toBe('chalotes');
  });
});
