import { describe, expect, it } from 'vitest';
import { generateDemoSessions } from '../../src/domain/demo';
import { durationOptions } from '../../src/domain/validation';

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const now = new Date('2026-10-13T15:00:00.000Z');
const DAY = 86_400_000;

describe('generateDemoSessions', () => {
  const sessions = generateDemoSessions(now, seededRand(42));

  it('only creates sessions from the last 30 days, all in the past', () => {
    expect(sessions.length).toBeGreaterThan(0);
    for (const s of sessions) {
      const start = new Date(s.startedAt).getTime();
      const end = new Date(s.endedAt).getTime();
      expect(start).toBeGreaterThanOrEqual(now.getTime() - 30 * DAY);
      expect(end).toBeLessThanOrEqual(now.getTime());
    }
  });

  it('uses real duration options', () => {
    const allowed = durationOptions(false);
    expect(sessions.every(s => allowed.includes(s.plannedMin))).toBe(true);
  });

  it('mixes statuses and tags', () => {
    expect(new Set(sessions.map(s => s.status)).size).toBe(2);
    expect(new Set(sessions.map(s => s.tag)).size).toBeGreaterThanOrEqual(3);
  });

  it('completes roughly 80% of sessions', () => {
    const share = sessions.filter(s => s.status === 'completed').length / sessions.length;
    expect(share).toBeGreaterThanOrEqual(0.7);
    expect(share).toBeLessThanOrEqual(0.9);
  });

  it('has unique ids', () => {
    expect(new Set(sessions.map(s => s.id)).size).toBe(sessions.length);
  });

  it('is deterministic for the same seed', () => {
    expect(generateDemoSessions(now, seededRand(42))).toEqual(sessions);
  });
});
