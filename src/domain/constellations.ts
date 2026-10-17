import type { Session } from './types';

export interface Point {
  x: number;
  y: number;
}

export interface Constellation {
  id: string;
  name: string;
  stars: Point[];
  lines: [number, number][];
}

export interface ConstellationProgress {
  id: string;
  name: string;
  lit: number;
  total: number;
  completedAt: string | null;
}

export interface SkyState {
  totalLit: number;
  constellations: ConstellationProgress[];
  extraStars: number;
}

// SVG viewBox units. The sky is a 2 × 4 grid of 500 × 400 cells, one constellation per cell.
export const SKY_WIDTH = 1000;
export const SKY_HEIGHT = 1600;
const CELL_W = 500;
const CELL_H = 400;
const CELL_PAD_X = 70;
const CELL_PAD_Y = 50;

// Shapes are drawn in a local 360 × 300 box and placed into their grid cell.
function place(cell: number, local: [number, number][]): Point[] {
  const col = cell % 2;
  const row = Math.floor(cell / 2);
  return local.map(([x, y]) => ({
    x: col * CELL_W + CELL_PAD_X + x,
    y: row * CELL_H + CELL_PAD_Y + y,
  }));
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'littleDipper',
    name: 'Little Dipper',
    stars: place(0, [
      [20, 30],
      [90, 60],
      [150, 100],
      [200, 150],
      [290, 140],
      [320, 220],
      [230, 240],
    ]),
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 3],
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    stars: place(1, [
      [10, 80],
      [90, 200],
      [180, 120],
      [260, 220],
      [350, 100],
    ]),
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    id: 'orion',
    name: 'Orion',
    stars: place(2, [
      [100, 20],
      [260, 40],
      [150, 140],
      [180, 150],
      [210, 160],
      [90, 280],
      [280, 270],
    ]),
    lines: [
      [0, 2],
      [1, 4],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6],
    ],
  },
  {
    id: 'bigDipper',
    name: 'Big Dipper',
    stars: place(3, [
      [10, 40],
      [80, 70],
      [140, 110],
      [200, 140],
      [210, 230],
      [330, 240],
      [320, 150],
    ]),
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 3],
    ],
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    stars: place(4, [
      [180, 10],
      [180, 130],
      [180, 290],
      [30, 100],
      [340, 170],
    ]),
    lines: [
      [0, 1],
      [1, 2],
      [3, 1],
      [1, 4],
    ],
  },
  {
    id: 'lyra',
    name: 'Lyra',
    stars: place(5, [
      [180, 20],
      [120, 150],
      [240, 160],
      [190, 290],
    ]),
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ],
  },
  {
    id: 'leo',
    name: 'Leo',
    stars: place(6, [
      [60, 40],
      [20, 120],
      [80, 200],
      [200, 230],
      [340, 270],
      [250, 140],
    ]),
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 3],
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    stars: place(7, [
      [20, 20],
      [60, 70],
      [110, 110],
      [160, 160],
      [200, 220],
      [260, 270],
      [330, 250],
      [350, 190],
    ]),
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
  },
];

export function getSkyState(sessions: Session[]): SkyState {
  const completed = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => a.endedAt.localeCompare(b.endedAt));

  let index = 0;
  const constellations = CONSTELLATIONS.map(c => {
    const total = c.stars.length;
    const lit = Math.min(total, Math.max(0, completed.length - index));
    const completedAt =
      lit === total ? completed[index + total - 1].endedAt : null;
    index += total;
    return { id: c.id, name: c.name, lit, total, completedAt };
  });

  return {
    totalLit: completed.length,
    constellations,
    extraStars: Math.max(0, completed.length - index),
  };
}

// mulberry32: tiny seeded PRNG so extra stars keep their place between renders.
// It works on 32-bit integers, so bitwise operators are the point here.
/* eslint-disable no-bitwise */
function seeded(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
/* eslint-enable no-bitwise */

export function extraStarPosition(index: number): Point {
  return {
    x: Math.round(seeded(index * 2 + 1) * SKY_WIDTH),
    y: Math.round(seeded(index * 2 + 2) * SKY_HEIGHT),
  };
}
