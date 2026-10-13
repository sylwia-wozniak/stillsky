import { describe, expect, it } from 'vitest';
import { durationOptions, isValidDuration, validateName } from '../../src/domain/validation';

describe('validateName', () => {
  it('trims and accepts a normal name', () => {
    expect(validateName('  Ada ')).toEqual({ ok: true, value: 'Ada' });
  });
  it('rejects whitespace-only names', () => {
    expect(validateName('   ')).toEqual({ ok: false, error: 'Please enter a name' });
  });
  it('accepts exactly 20 characters', () => {
    expect(validateName('a'.repeat(20)).ok).toBe(true);
  });
  it('rejects 21 characters', () => {
    expect(validateName('a'.repeat(21))).toEqual({
      ok: false,
      error: 'Name must be at most 20 characters',
    });
  });
  it('counts emoji as one character each', () => {
    expect(validateName('🌟'.repeat(20)).ok).toBe(true);
  });
});

describe('durations', () => {
  it('offers 10–120 in 5-minute steps in release', () => {
    expect(durationOptions(false)).toEqual([
      10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115,
      120,
    ]);
  });
  it('adds a 1-minute option first in debug', () => {
    expect(durationOptions(true)[0]).toBe(1);
  });
  it('validates against the offered options', () => {
    expect(isValidDuration(1, false)).toBe(false);
    expect(isValidDuration(1, true)).toBe(true);
    expect(isValidDuration(12, true)).toBe(false);
    expect(isValidDuration(125, false)).toBe(false);
  });
});
