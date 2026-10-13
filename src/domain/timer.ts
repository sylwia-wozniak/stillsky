import type { ActiveSession, Session } from './types';

const MS_PER_MIN = 60_000;

export function plannedEnd(a: ActiveSession): Date {
  return new Date(new Date(a.startedAt).getTime() + a.plannedMin * MS_PER_MIN);
}

export function remainingMs(a: ActiveSession, now: Date): number {
  return Math.max(0, plannedEnd(a).getTime() - now.getTime());
}

export function progress(a: ActiveSession, now: Date): number {
  const total = a.plannedMin * MS_PER_MIN;
  return Math.min(1, Math.max(0, 1 - remainingMs(a, now) / total));
}

export function formatMMSS(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function completeSession(a: ActiveSession, id: string): Session {
  return {
    id,
    ...a,
    endedAt: plannedEnd(a).toISOString(),
    status: 'completed',
  };
}

export function failSession(a: ActiveSession, now: Date, id: string): Session {
  return { id, ...a, endedAt: now.toISOString(), status: 'failed' };
}

export function restoreActiveSession(
  a: ActiveSession | null,
  now: Date,
  id: string,
): { active: ActiveSession | null; completed: Session | null } {
  if (!a) {
    return { active: null, completed: null };
  }
  if (remainingMs(a, now) === 0) {
    return { active: null, completed: completeSession(a, id) };
  }
  return { active: a, completed: null };
}
