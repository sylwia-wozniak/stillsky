import { describe, expect, it } from 'vitest';
import {
  CONSTELLATIONS,
  SKY_HEIGHT,
  SKY_WIDTH,
  extraStarPosition,
  getSkyState,
} from '../../src/domain/constellations';
import type { Session, SessionStatus } from '../../src/domain/types';

function session(i: number, status: SessionStatus = 'completed'): Session {
  const start = new Date(Date.UTC(2026, 9, 1, 8) + i * 3_600_000);
  return {
    id: `s${i}`,
    startedAt: start.toISOString(),
    endedAt: new Date(start.getTime() + 25 * 60_000).toISOString(),
    plannedMin: 25,
    intention: 'work',
    status,
  };
}
const completed = (n: number) => Array.from({ length: n }, (_, i) => session(i));

describe('CONSTELLATIONS', () => {
  it('has the fixed order and star counts', () => {
    expect(CONSTELLATIONS.map(c => [c.id, c.stars.length])).toEqual([
      ['littleDipper', 7],
      ['cassiopeia', 5],
      ['orion', 7],
      ['bigDipper', 7],
      ['cygnus', 5],
      ['lyra', 4],
      ['leo', 6],
      ['scorpius', 8],
    ]);
    expect(CONSTELLATIONS.reduce((n, c) => n + c.stars.length, 0)).toBe(49);
  });

  it('keeps every star inside the sky', () => {
    for (const c of CONSTELLATIONS) {
      for (const s of c.stars) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(SKY_WIDTH);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeLessThanOrEqual(SKY_HEIGHT);
      }
    }
  });

  it('gives each constellation its own region', () => {
    const boxes = CONSTELLATIONS.map(c => ({
      id: c.id,
      minX: Math.min(...c.stars.map(s => s.x)),
      maxX: Math.max(...c.stars.map(s => s.x)),
      minY: Math.min(...c.stars.map(s => s.y)),
      maxY: Math.max(...c.stars.map(s => s.y)),
    }));
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const overlap = a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;
        expect(overlap, `${a.id} overlaps ${b.id}`).toBe(false);
      }
    }
  });

  it('only draws lines between existing stars', () => {
    for (const c of CONSTELLATIONS) {
      for (const [p, q] of c.lines) {
        expect(p).toBeLessThan(c.stars.length);
        expect(q).toBeLessThan(c.stars.length);
      }
    }
  });
});

describe('getSkyState', () => {
  it('is empty without sessions', () => {
    const sky = getSkyState([]);
    expect(sky.totalLit).toBe(0);
    expect(sky.extraStars).toBe(0);
    expect(sky.constellations.every(c => c.lit === 0 && c.completedAt === null)).toBe(true);
  });

  it('fills constellations in order', () => {
    const sessions = completed(8);
    const sky = getSkyState(sessions);
    expect(sky.constellations[0]).toMatchObject({
      id: 'littleDipper',
      lit: 7,
      total: 7,
      completedAt: sessions[6].endedAt,
    });
    expect(sky.constellations[1]).toMatchObject({ id: 'cassiopeia', lit: 1, completedAt: null });
  });

  it('ignores failed sessions', () => {
    const sessions = [session(0, 'failed'), session(1, 'failed'), session(2, 'failed'), session(3), session(4)];
    expect(getSkyState(sessions).totalLit).toBe(2);
  });

  it('orders stars by end time even when sessions are stored out of order', () => {
    const sessions = completed(8);
    const reversed = [...sessions].reverse();
    expect(getSkyState(reversed).constellations[0].completedAt).toBe(sessions[6].endedAt);
  });

  it('turns stars beyond the last constellation into extra stars', () => {
    const sky = getSkyState(completed(52));
    expect(sky.constellations.every(c => c.lit === c.total)).toBe(true);
    expect(sky.extraStars).toBe(3);
  });
});

describe('extraStarPosition', () => {
  it('is deterministic and inside the sky', () => {
    const p = extraStarPosition(5);
    expect(extraStarPosition(5)).toEqual(p);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeLessThanOrEqual(SKY_WIDTH);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(SKY_HEIGHT);
  });
});
