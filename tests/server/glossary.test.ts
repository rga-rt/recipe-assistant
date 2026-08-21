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

  it('leaves unrelated text untouched', () => {
    expect(fixCulinary('sal y pimienta')).toBe('sal y pimienta');
  });
});
