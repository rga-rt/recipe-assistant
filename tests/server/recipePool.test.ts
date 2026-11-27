import { describe, it, expect } from 'vitest';
import { shuffle } from '~/server/utils/recipePool';

const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('shuffle', () => {
  it('keeps the same elements', () => {
    const out = shuffle(items, seeded(1));
    expect(out.map((x) => x.id).sort((a, b) => a - b)).toEqual(items.map((x) => x.id));
  });

  it('does not mutate the input', () => {
    const copy = structuredClone(items);
    shuffle(items, seeded(2));
    expect(items).toEqual(copy);
  });

  it('produces different orders for different random sources', () => {
    const a = shuffle(items, seeded(3)).map((x) => x.id);
    const b = shuffle(items, seeded(4)).map((x) => x.id);
    expect(a).not.toEqual(b);
  });
});
