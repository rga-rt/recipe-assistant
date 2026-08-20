/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import en from '~/locales/en.json';
import es from '~/locales/es.json';
import { INGREDIENT_CATEGORIES } from '~/data/ingredients';

function keys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object'
      ? keys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

describe('i18n messages', () => {
  it('en and es have identical key sets', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it('has a category label for every catalog category', () => {
    for (const cat of INGREDIENT_CATEGORIES) {
      expect((en as any).categories[cat.id]).toBeTruthy();
      expect((es as any).categories[cat.id]).toBeTruthy();
    }
  });

  it('has required top-level namespaces', () => {
    for (const ns of ['nav', 'start', 'select', 'results', 'recipe', 'favorites', 'units', 'errors']) {
      expect((en as any)[ns]).toBeTruthy();
    }
  });
});
