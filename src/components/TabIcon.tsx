import React from 'react';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

export type TabIconName = 'Focus' | 'Sky' | 'Stats' | 'Settings';

const SIZE = 22;

/**
 * Line icons drawn with SVG so they look identical on iOS and Android and follow the tab tint
 * (Unicode symbols like ⚙ render as colour emoji on iOS). Shapes from Feather icons (MIT).
 */
export function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      {name === 'Focus' && (
        <Polygon
          {...stroke}
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        />
      )}
      {name === 'Sky' && (
        <Path {...stroke} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      )}
      {name === 'Stats' && (
        <>
          <Line {...stroke} x1={18} y1={20} x2={18} y2={10} />
          <Line {...stroke} x1={12} y1={20} x2={12} y2={4} />
          <Line {...stroke} x1={6} y1={20} x2={6} y2={14} />
        </>
      )}
      {name === 'Settings' && (
        <>
          <Circle {...stroke} cx={12} cy={12} r={3} />
          <Path
            {...stroke}
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </>
      )}
    </Svg>
  );
}
