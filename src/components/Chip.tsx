import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress(): void;
  testID: string;
  accessibilityLabel: string;
}

export function Chip({
  label,
  selected,
  onPress,
  testID,
  accessibilityLabel,
}: ChipProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: spacing.sm,
    alignSelf: 'flex-start',
    minWidth: 52,
    alignItems: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontSize: 15, fontFamily: fonts.regular },
  selectedText: { color: colors.onPrimary, fontFamily: fonts.medium },
});
