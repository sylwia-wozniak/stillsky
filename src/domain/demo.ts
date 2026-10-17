import { INTENTIONS, type Session } from './types';
import { durationOptions } from './validation';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const DAYS = 30;
const COMPLETED_SHARE = 0.8;
const ID_PREFIX = 'demo-';

export function isDemoSession(s: Session): boolean {
  return s.id.startsWith(ID_PREFIX);
}

/** ~30 days of plausible sessions for exploring Sky and Stats in debug builds. */
export function generateDemoSessions(
  now: Date,
  rand: () => number = Math.random,
): Session[] {
  const durations = durationOptions(false).filter(m => m <= 90);
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];
  const sessions: Session[] = [];

  for (let daysAgo = 0; daysAgo < DAYS; daysAgo++) {
    const count = 1 + Math.floor(rand() * 4);
    for (let k = 0; k < count; k++) {
      // Start 2–22 hours before "now minus daysAgo": always in the past and inside the window.
      const start =
        now.getTime() - daysAgo * DAY_MS - (2 + rand() * 20) * HOUR_MS;
      const plannedMin = pick(durations);
      const completed = rand() < COMPLETED_SHARE;
      const failedAfterMin = Math.max(1, Math.floor(plannedMin * rand()));
      sessions.push({
        id: `${ID_PREFIX}${daysAgo}-${k}`,
        startedAt: new Date(start).toISOString(),
        endedAt: new Date(
          start + (completed ? plannedMin : failedAfterMin) * 60_000,
        ).toISOString(),
        plannedMin,
        intention: pick(INTENTIONS).id,
        status: completed ? 'completed' : 'failed',
      });
    }
  }
  return sessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}
