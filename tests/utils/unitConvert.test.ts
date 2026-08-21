import { describe, it, expect } from 'vitest';
import { toMetric } from '~/utils/unitConvert';

describe('toMetric', () => {
  it('converts ounces to grams', () => {
    const c = toMetric(24, 'ounces')!;
    expect(c.unit).toBe('g');
    expect(Math.round(c.amount)).toBe(680); // 24 * 28.3495
  });

  it('converts oz (short form) to grams too', () => {
    expect(toMetric(1, 'oz')!.unit).toBe('g');
  });

  it('promotes large gram results to kilograms', () => {
    const c = toMetric(3, 'pounds')!; // ~1361 g
    expect(c.unit).toBe('kg');
    expect(c.amount).toBeCloseTo(1.361, 2);
  });

  it('converts fluid ounces to millilitres', () => {
    const c = toMetric(8, 'fl. oz.')!;
    expect(c.unit).toBe('ml');
    expect(Math.round(c.amount)).toBe(237);
  });

  it('handles the plural long form "fl. oz.s"', () => {
    expect(toMetric(8, 'fl. oz.s')!.unit).toBe('ml');
  });

  it('promotes large millilitre results to litres (gallons)', () => {
    const c = toMetric(1, 'gallon')!;
    expect(c.unit).toBe('l');
    expect(c.amount).toBeCloseTo(3.785, 2);
  });

  it('converts inches to centimetres', () => {
    const c = toMetric(4, 'inches')!;
    expect(c.unit).toBe('cm');
    expect(c.amount).toBeCloseTo(10.16, 2);
  });

  it('returns null for units that should stay as-is (cup, tbsp, grams, empty)', () => {
    expect(toMetric(1, 'cup')).toBeNull();
    expect(toMetric(2, 'Tbsps')).toBeNull();
    expect(toMetric(200, 'grams')).toBeNull();
    expect(toMetric(1, '')).toBeNull();
  });
});
