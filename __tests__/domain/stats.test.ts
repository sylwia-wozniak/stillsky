import { describe, expect, it } from 'vitest';
import { computeStats, formatMinutes, periodRange } from '../../src/domain/stats';
import type { Session, SessionStatus, Intention } from '../../src/domain/types';

// npm test runs with TZ=UTC, so local-time constructors are stable.
function session(start: Date, plannedMin: number, intention: Intention, status: SessionStatus): Session {
  return {
    id: start.toISOString(),
    startedAt: start.toISOString(),
    endedAt: new Date(start.getTime() + plannedMin * 60_000).toISOString(),
    plannedMin,
    intention,
    status,
  };
}
const now = new Date(2026, 9, 13, 15, 0); // Tue 13 Oct 2026

describe('computeStats', () => {
  it('returns zeros and a null success rate without sessions', () => {
    expect(computeStats([], 'week', now)).toEqual({
      totalMin: 0,
      completed: 0,
      failed: 0,
      successRate: null,
      bars: [0, 0, 0, 0, 0, 0, 0],
      intentionMinutes: { work: 0, study: 0, reading: 0, other: 0 },
    });
  });

  it('counts only completed minutes and buckets by hour for a day', () => {
    const sessions = [
      session(new Date(2026, 9, 13, 9, 0), 25, 'study', 'completed'),
      session(new Date(2026, 9, 13, 11, 0), 50, 'work', 'failed'),
    ];
    const s = computeStats(sessions, 'day', now);
    expect(s.totalMin).toBe(25);
    expect(s.completed).toBe(1);
    expect(s.failed).toBe(1);
    expect(s.successRate).toBe(50);
    expect(s.bars).toHaveLength(24);
    expect(s.bars[9]).toBe(25);
    expect(s.bars[11]).toBe(0);
    expect(s.intentionMinutes.study).toBe(25);
    expect(s.intentionMinutes.work).toBe(0);
  });

  it('puts Sunday 23:59 in the current week and Monday 00:00 in the next', () => {
    const sunday = session(new Date(2026, 9, 18, 23, 59), 30, 'work', 'completed');
    const monday = session(new Date(2026, 9, 19, 0, 0), 40, 'work', 'completed');
    const s = computeStats([sunday, monday], 'week', now);
    expect(s.bars[6]).toBe(30);
    expect(s.totalMin).toBe(30);
  });

  it('has one bar per day of the month', () => {
    expect(computeStats([], 'month', new Date(2026, 1, 10)).bars).toHaveLength(28);
    expect(computeStats([], 'month', now).bars).toHaveLength(31);
  });

  it('rounds the success rate to a whole percent', () => {
    const sessions = [
      session(new Date(2026, 9, 13, 8), 10, 'work', 'completed'),
      session(new Date(2026, 9, 13, 9), 10, 'work', 'completed'),
      session(new Date(2026, 9, 13, 10), 10, 'work', 'failed'),
    ];
    expect(computeStats(sessions, 'day', now).successRate).toBe(67);
  });
});

describe('periodRange', () => {
  it('starts weeks on Monday', () => {
    expect(periodRange('week', new Date(2026, 9, 13))).toEqual({
      start: new Date(2026, 9, 12),
      end: new Date(2026, 9, 19),
    });
  });
  it('treats Sunday as the end of the week', () => {
    expect(periodRange('week', new Date(2026, 9, 18, 12)).start).toEqual(new Date(2026, 9, 12));
  });
});

describe('formatMinutes', () => {
  it.each([
    [0, '0m'],
    [25, '25m'],
    [60, '1h'],
    [85, '1h 25m'],
  ])('formats %i as "%s"', (min, expected) => {
    expect(formatMinutes(min)).toBe(expected);
  });
});
