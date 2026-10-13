import type { Session, Tag } from './types';

export type Period = 'day' | 'week' | 'month';

export interface Stats {
  totalMin: number;
  completed: number;
  failed: number;
  successRate: number | null;
  bars: number[];
  tagMinutes: Record<Tag, number>;
}

/** Local-time range [start, end) of the period containing `now`. Weeks start on Monday. */
export function periodRange(period: Period, now: Date): { start: Date; end: Date } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  if (period === 'day') {
    return { start: new Date(y, m, d), end: new Date(y, m, d + 1) };
  }
  if (period === 'week') {
    const daysSinceMonday = (now.getDay() + 6) % 7;
    return { start: new Date(y, m, d - daysSinceMonday), end: new Date(y, m, d - daysSinceMonday + 7) };
  }
  return { start: new Date(y, m, 1), end: new Date(y, m + 1, 1) };
}

function barCount(period: Period, start: Date): number {
  if (period === 'day') return 24;
  if (period === 'week') return 7;
  return new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
}

function barIndex(period: Period, date: Date): number {
  if (period === 'day') return date.getHours();
  if (period === 'week') return (date.getDay() + 6) % 7;
  return date.getDate() - 1;
}

export function computeStats(sessions: Session[], period: Period, now: Date): Stats {
  const { start, end } = periodRange(period, now);
  const stats: Stats = {
    totalMin: 0,
    completed: 0,
    failed: 0,
    successRate: null,
    bars: new Array(barCount(period, start)).fill(0),
    tagMinutes: { work: 0, study: 0, reading: 0, other: 0 },
  };

  for (const s of sessions) {
    const started = new Date(s.startedAt);
    if (started < start || started >= end) continue;
    if (s.status === 'failed') {
      stats.failed += 1;
      continue;
    }
    stats.completed += 1;
    stats.totalMin += s.plannedMin;
    stats.bars[barIndex(period, started)] += s.plannedMin;
    stats.tagMinutes[s.tag] += s.plannedMin;
  }

  const finished = stats.completed + stats.failed;
  stats.successRate = finished === 0 ? null : Math.round((stats.completed / finished) * 100);
  return stats;
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
