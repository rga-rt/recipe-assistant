import { describe, it, expect } from 'vitest';
import { CUISINES } from '~/data/cuisines';

describe('CUISINES', () => {
  it('lists the 27 Spoonacular cuisines', () => {
    expect(CUISINES).toHaveLength(27);
    expect(CUISINES[0]).toBe('african');
    expect(CUISINES).toContain('eastern european');
    expect(CUISINES[26]).toBe('vietnamese');
  });

  it('has no duplicates and is all lowercase', () => {
    expect(new Set(CUISINES).size).toBe(CUISINES.length);
    for (const c of CUISINES) expect(c).toBe(c.toLowerCase());
  });
});
