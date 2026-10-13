import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TID } from '../testIds';
import { colors, spacing } from '../theme/theme';

const HIDE_AFTER_MS = 3000;

export function Toast({ message, onHide }: { message: string | null; onHide(): void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onHide, HIDE_AFTER_MS);
    return () => clearTimeout(t);
  }, [message, onHide]);

  if (!message) return null;
  return (
    <View style={styles.toast} testID={TID.toast} accessibilityLabel={message} accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 100,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  text: { color: colors.text, textAlign: 'center' },
});
