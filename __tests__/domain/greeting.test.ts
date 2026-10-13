import { describe, expect, it } from 'vitest';
import { greeting } from '../../src/domain/greeting';

describe('greeting', () => {
  it.each([
    [5, 'Good morning, Ada'],
    [11, 'Good morning, Ada'],
    [12, 'Good afternoon, Ada'],
    [17, 'Good afternoon, Ada'],
    [18, 'Good evening, Ada'],
    [3, 'Good evening, Ada'],
  ])('at %i:00 says "%s"', (hour, expected) => {
    expect(greeting('Ada', hour)).toBe(expected);
  });
});
