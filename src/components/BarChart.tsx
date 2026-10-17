import React, { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { TID } from '../testIds';
import { colors, spacing, typography } from '../theme/theme';

const HEIGHT = 140;
const GAP = 2;
const LABEL_W = 32;

interface BarChartProps {
  values: number[];
  labels: string[];
  /** Show every n-th label under the chart so dense charts stay readable. */
  labelEvery?: number;
}

export function BarChart({ values, labels, labelEvery = 1 }: BarChartProps) {
  const [width, setWidth] = useState(0);
  const max = Math.max(1, ...values);
  const barW = width > 0 ? width / values.length : 0;
  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  return (
    <View>
      <View style={{ height: HEIGHT }} onLayout={onLayout}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {values.map((v, i) => {
              const h = (v / max) * (HEIGHT - 4);
              return (
                <Rect
                  key={i}
                  x={i * barW + GAP / 2}
                  y={HEIGHT - Math.max(h, 2)}
                  width={Math.max(barW - GAP, 1)}
                  height={Math.max(h, 2)}
                  rx={2}
                  fill={v > 0 ? colors.accent : colors.glassStrong}
                />
              );
            })}
          </Svg>
        )}
        {/* Invisible per-bar views carry testIDs, since SVG rects are not exposed to automation. */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {values.map((v, i) => (
            <View
              key={i}
              testID={TID.stats.bar(i)}
              accessibilityLabel={`${labels[i]}: ${v} minutes`}
              accessible
              style={[styles.hit, { left: i * barW, width: barW }]}
            />
          ))}
        </View>
      </View>
      {/* Labels are wider than a bar in dense charts (a month has ~9 px per bar), so each one
          is centred under its bar instead of being clipped to the bar's width. */}
      <View style={styles.labels}>
        {labels.map((l, i) =>
          i % labelEvery === 0 ? (
            <Text
              key={i}
              style={[styles.label, { left: (i + 0.5) * barW - LABEL_W / 2 }]}
              numberOfLines={1}
            >
              {l}
            </Text>
          ) : null,
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', top: 0, bottom: 0 },
  labels: { height: 14, marginTop: spacing.xs },
  label: {
    ...typography.caption,
    position: 'absolute',
    width: LABEL_W,
    fontSize: 10,
    textAlign: 'center',
  },
});
