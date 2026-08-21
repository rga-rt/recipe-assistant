import { describe, it, expect } from 'vitest';
import { fixCulinary } from '~/server/utils/translation/glossary';

describe('fixCulinary', () => {
  it('corrects the "gasa" chiffonade mistranslation', () => {
    expect(fixCulinary('albahaca gasa de albahaca')).toContain(
      'albahaca en chiffonade',
    );
  });

  it('does not double the preposition (no "en en chiffonade")', () => {
    expect(fixCulinary('albahaca en chiffonade')).toBe('albahaca en chiffonade');
    expect(fixCulinary('albahaca chiffonade')).toBe('albahaca en chiffonade');
    expect(fixCulinary('una guarnición de albahaca en chiffonade')).not.toMatch(
      /en\s+en/,
    );
  });

  it('strips leaked MT disambiguation tags', () => {
    expect(fixCulinary('feta de queso (sustancia)')).toBe('feta de queso');
  });

  it('restores dropped range separators for time/temperature', () => {
    expect(fixCulinary('cocina 4 5 minutos')).toBe('cocina 4 a 5 minutos');
    expect(fixCulinary('hornea a 180 200 grados')).toBe(
      'hornea a 180 a 200 grados',
    );
  });

  it('does not touch numbers that are not a time/temp range', () => {
    expect(fixCulinary('1 1/2 tazas de harina')).toBe('1 1/2 tazas de harina');
  });

  it('leaves unrelated text untouched', () => {
    expect(fixCulinary('sal y pimienta')).toBe('sal y pimienta');
  });
});
