import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TID } from '../testIds';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';

export interface ConfirmDialogProps {
  visible: boolean;
  message: string;
  confirmLabel: string;
  onConfirm(): void;
  onCancel(): void;
  /** When set, the user must type exactly this text before confirming. */
  requireText?: string;
}

export function ConfirmDialog({
  visible,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  requireText,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (!visible) setTyped('');
  }, [visible]);
  const canConfirm = requireText === undefined || typed === requireText;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card} testID={TID.dialog.container}>
          <Text
            style={typography.body}
            testID={TID.dialog.message}
            accessibilityLabel={message}
          >
            {message}
          </Text>
          {requireText !== undefined ? (
            <TextInput
              testID={TID.dialog.input}
              accessibilityLabel={`Type ${requireText} to confirm`}
              style={styles.input}
              value={typed}
              onChangeText={setTyped}
              placeholder={requireText}
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          ) : null}
          <View style={styles.row}>
            <Pressable
              testID={TID.dialog.cancelButton}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              onPress={onCancel}
              style={[styles.button, styles.cancel]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              testID={TID.dialog.confirmButton}
              accessibilityLabel={confirmLabel}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canConfirm }}
              disabled={!canConfirm}
              onPress={onConfirm}
              style={[
                styles.button,
                styles.confirm,
                !canConfirm && styles.disabled,
              ]}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.dialog,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  input: {
    fontFamily: fonts.regular,
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    color: colors.text,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
  },
  cancel: { backgroundColor: 'transparent' },
  cancelText: { color: colors.text, fontSize: 16, fontFamily: fonts.regular },
  confirm: { backgroundColor: colors.danger },
  confirmText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  disabled: { opacity: 0.4 },
});
