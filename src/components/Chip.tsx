import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress(): void;
  testID: string;
  accessibilityLabel: string;
}

export function Chip({ label, selected, onPress, testID, accessibilityLabel }: ChipProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    alignSelf: 'flex-start',
  },
  selected: { backgroundColor: colors.accent },
  text: { color: colors.text, fontSize: 15 },
  selectedText: { color: colors.background, fontWeight: '600' },
});
