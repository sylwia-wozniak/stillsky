import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import {
  CONSTELLATIONS,
  SKY_HEIGHT,
  SKY_WIDTH,
  extraStarPosition,
  type SkyState,
} from '../domain/constellations';
import { TID } from '../testIds';
import { colors } from '../theme/theme';

const HIT_PAD = 30; // viewBox units around a constellation's bounding box

interface SkyCanvasProps {
  sky: SkyState;
  onSelect(id: string): void;
}

export function SkyCanvas({ sky, onSelect }: SkyCanvasProps) {
  const { width } = useWindowDimensions();
  const scale = width / SKY_WIDTH;
  const currentIndex = sky.constellations.findIndex(c => c.lit < c.total);

  return (
    <View style={{ width, height: SKY_HEIGHT * scale }} testID={TID.sky.canvas}>
      <Svg
        width={width}
        height={SKY_HEIGHT * scale}
        viewBox={`0 0 ${SKY_WIDTH} ${SKY_HEIGHT}`}
      >
        {Array.from({ length: sky.extraStars }, (_, i) => {
          const p = extraStarPosition(i);
          return (
            <Circle
              key={`extra-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={colors.star}
              opacity={0.8}
            />
          );
        })}
        {CONSTELLATIONS.map((c, ci) => {
          const progress = sky.constellations[ci];
          const complete = progress.lit === progress.total;
          const isCurrent = ci === currentIndex;
          const labelX = Math.min(...c.stars.map(s => s.x));
          const labelY = Math.max(...c.stars.map(s => s.y)) + 40;
          return (
            <React.Fragment key={c.id}>
              {complete &&
                c.lines.map(([a, b]) => (
                  <Line
                    key={`${c.id}-${a}-${b}`}
                    x1={c.stars[a].x}
                    y1={c.stars[a].y}
                    x2={c.stars[b].x}
                    y2={c.stars[b].y}
                    stroke={colors.accent}
                    strokeOpacity={0.5}
                    strokeWidth={2}
                  />
                ))}
              {c.stars.map((s, si) => {
                const lit = si < progress.lit;
                if (!lit && !isCurrent) return null;
                return (
                  <React.Fragment key={`${c.id}-${si}`}>
                    {lit && (
                      <Circle
                        cx={s.x}
                        cy={s.y}
                        r={18}
                        fill={colors.star}
                        opacity={0.15}
                      />
                    )}
                    <Circle
                      cx={s.x}
                      cy={s.y}
                      r={lit ? 8 : 5}
                      fill={lit ? colors.star : colors.muted}
                      opacity={lit ? 1 : 0.35}
                    />
                  </React.Fragment>
                );
              })}
              {complete && (
                <SvgText
                  x={labelX}
                  y={labelY}
                  fill={colors.muted}
                  fontSize={26}
                  fontFamily="Outfit-Regular"
                >
                  {c.name}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
      {/* SVG shapes are not reliably exposed to UI automation, so each constellation gets a
          transparent touch target that carries its testID and label. */}
      {CONSTELLATIONS.map((c, ci) => {
        const progress = sky.constellations[ci];
        const xs = c.stars.map(s => s.x);
        const ys = c.stars.map(s => s.y);
        const left = (Math.min(...xs) - HIT_PAD) * scale;
        const top = (Math.min(...ys) - HIT_PAD) * scale;
        return (
          <Pressable
            key={c.id}
            testID={TID.sky.constellation(c.id)}
            accessibilityLabel={`${c.name}, ${progress.lit} of ${progress.total} stars`}
            accessibilityRole="button"
            onPress={() => onSelect(c.id)}
            style={[
              styles.hit,
              {
                left,
                top,
                width:
                  (Math.max(...xs) - Math.min(...xs) + HIT_PAD * 2) * scale,
                height:
                  (Math.max(...ys) - Math.min(...ys) + HIT_PAD * 2) * scale,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute' },
});
