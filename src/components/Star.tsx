import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { TID } from '../testIds';
import { colors } from '../theme/theme';

const SIZE = 220;
const FALL_MS = 900;

interface StarProps {
  /** 0 (dim) … 1 (fully lit) */
  brightness: number;
  falling?: boolean;
  flash?: boolean;
  onFallEnd?(): void;
}

export function Star({ brightness, falling = false, flash = false, onFallEnd }: StarProps) {
  const glow = useSharedValue(brightness);
  const scale = useSharedValue(1);
  const fall = useSharedValue(0);

  useEffect(() => {
    glow.value = withTiming(brightness, { duration: 900 });
  }, [brightness, glow]);

  useEffect(() => {
    if (!flash) return;
    glow.value = 1;
    scale.value = withSequence(withTiming(1.35, { duration: 250 }), withTiming(1, { duration: 500 }));
  }, [flash, glow, scale]);

  useEffect(() => {
    if (!falling) {
      fall.value = 0;
      return;
    }
    fall.value = withTiming(1, { duration: FALL_MS, easing: Easing.in(Easing.quad) }, finished => {
      if (finished && onFallEnd) scheduleOnRN(onFallEnd);
    });
  }, [falling, fall, onFallEnd]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - fall.value,
    transform: [
      { translateX: fall.value * 160 },
      { translateY: fall.value * 420 },
      { scale: scale.value * (1 - fall.value * 0.6) },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.15 + glow.value * 0.85 }));

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      testID={TID.focus.star}
      accessibilityLabel={`Star ${Math.round(brightness * 100)} percent lit`}>
      <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.star} stopOpacity="0.9" />
              <Stop offset="0.35" stopColor={colors.star} stopOpacity="0.35" />
              <Stop offset="1" stopColor={colors.star} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2} fill="url(#glow)" />
        </Svg>
      </Animated.View>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={14} fill={colors.star} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignSelf: 'center' },
});
