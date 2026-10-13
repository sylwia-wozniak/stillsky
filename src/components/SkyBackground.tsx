import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import {
  extraStarPosition,
  SKY_HEIGHT,
  SKY_WIDTH,
} from '../domain/constellations';
import { colors } from '../theme/theme';

const FAINT_STARS = 45;

/** Dusk gradient, two soft haze layers and faint stars, drawn once behind every screen. */
export function SkyBackground() {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(
    () =>
      Array.from({ length: FAINT_STARS }, (_, i) => {
        const p = extraStarPosition(1000 + i);
        return {
          x: (p.x / SKY_WIDTH) * width,
          y: (p.y / SKY_HEIGHT) * height * 0.75,
          r: (i % 3) * 0.4 + 0.6,
        };
      }),
    [width, height],
  );

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.gradientTop} />
          <Stop offset="0.55" stopColor={colors.gradientMid} />
          <Stop offset="1" stopColor={colors.gradientBottom} />
        </LinearGradient>
        <RadialGradient id="hazeRose" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#F2A7C3" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#F2A7C3" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="hazeViolet" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#8E7BFF" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#8E7BFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#dusk)" />
      <Circle
        cx={width * 0.85}
        cy={height * 0.18}
        r={width * 0.7}
        fill="url(#hazeViolet)"
      />
      <Circle
        cx={width * 0.1}
        cy={height * 0.95}
        r={width * 0.9}
        fill="url(#hazeRose)"
      />
      {stars.map((s, i) => (
        <Circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#FFFFFF"
          opacity={0.35 + (i % 4) * 0.1}
        />
      ))}
    </Svg>
  );
}
