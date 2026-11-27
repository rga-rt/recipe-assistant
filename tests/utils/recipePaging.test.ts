import { describe, it, expect } from 'vitest';
import { rankPages } from '~/utils/recipePaging';
import type { RecipeSummary } from '~/types/recipe';

const r = (id: number, missedCount: number, usedCount = 1): RecipeSummary => ({
  id, title: `R${id}`, image: '', usedCount, missedCount,
});

describe('rankPages', () => {
  it('sorts each page of 24 by fewest missing, then most used', () => {
    const out = rankPages([r(1, 2, 1), r(2, 0, 1), r(3, 0, 3)], 24);
    expect(out.map((x) => x.id)).toEqual([3, 2, 1]);
  });

  it('never moves an item across a page boundary', () => {
    // 24 items missing 5, then 6 items missing 0
    const items = [
      ...Array.from({ length: 24 }, (_, i) => r(i, 5)),
      ...Array.from({ length: 6 }, (_, i) => r(100 + i, 0)),
    ];
    const out = rankPages(items, 24);
    expect(out.slice(0, 24).every((x) => x.id < 100)).toBe(true);
    expect(out.slice(24).map((x) => x.id).sort()).toEqual([100, 101, 102, 103, 104, 105]);
  });

  it('does not mutate its input', () => {
    const items = [r(1, 3), r(2, 0)];
    const copy = structuredClone(items);
    rankPages(items);
    expect(items).toEqual(copy);
  });
});
