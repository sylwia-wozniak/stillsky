import { describe, expect, it } from 'vitest';
import {
  completeSession,
  failSession,
  formatMMSS,
  progress,
  remainingMs,
  restoreActiveSession,
} from '../../src/domain/timer';
import type { ActiveSession } from '../../src/domain/types';

const a: ActiveSession = { startedAt: '2026-10-13T10:00:00.000Z', plannedMin: 25, tag: 'work' };
const at = (iso: string) => new Date(iso);

describe('remainingMs', () => {
  it('is the full duration at start', () => {
    expect(remainingMs(a, at('2026-10-13T10:00:00Z'))).toBe(1_500_000);
  });
  it('counts down', () => {
    expect(remainingMs(a, at('2026-10-13T10:24:59.500Z'))).toBe(500);
  });
  it('never goes below zero', () => {
    expect(remainingMs(a, at('2026-10-13T10:30:00Z'))).toBe(0);
  });
});

describe('progress', () => {
  it('is 0.5 halfway', () => {
    expect(progress(a, at('2026-10-13T10:12:30Z'))).toBe(0.5);
  });
  it('is clamped to 1 after the end', () => {
    expect(progress(a, at('2026-10-13T11:00:00Z'))).toBe(1);
  });
});

describe('formatMMSS', () => {
  it('formats whole minutes', () => {
    expect(formatMMSS(1_500_000)).toBe('25:00');
  });
  it('rounds partial seconds up', () => {
    expect(formatMMSS(500)).toBe('00:01');
  });
  it('formats zero', () => {
    expect(formatMMSS(0)).toBe('00:00');
  });
  it('allows three-digit minutes', () => {
    expect(formatMMSS(7_200_000)).toBe('120:00');
  });
});

describe('session results', () => {
  it('completes at the planned end', () => {
    expect(completeSession(a, 'x')).toEqual({
      id: 'x',
      startedAt: a.startedAt,
      endedAt: '2026-10-13T10:25:00.000Z',
      plannedMin: 25,
      tag: 'work',
      status: 'completed',
    });
  });
  it('fails at the give-up time', () => {
    const s = failSession(a, at('2026-10-13T10:05:00Z'), 'y');
    expect(s.status).toBe('failed');
    expect(s.endedAt).toBe('2026-10-13T10:05:00.000Z');
  });
});

describe('restoreActiveSession', () => {
  it('completes a session whose time ran out while the app was closed', () => {
    expect(restoreActiveSession(a, at('2026-10-13T18:00:00Z'), 'z')).toEqual({
      active: null,
      completed: {
        id: 'z',
        startedAt: a.startedAt,
        endedAt: '2026-10-13T10:25:00.000Z',
        plannedMin: 25,
        tag: 'work',
        status: 'completed',
      },
    });
  });
  it('resumes a session that is still running', () => {
    expect(restoreActiveSession(a, at('2026-10-13T10:10:00Z'), 'z')).toEqual({
      active: a,
      completed: null,
    });
  });
  it('does nothing without an active session', () => {
    expect(restoreActiveSession(null, at('2026-10-13T10:10:00Z'), 'z')).toEqual({
      active: null,
      completed: null,
    });
  });
});
