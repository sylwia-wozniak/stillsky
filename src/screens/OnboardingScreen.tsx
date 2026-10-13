import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateName } from '../domain/validation';
import { useApp } from '../state/AppProvider';
import { TID } from '../testIds';
import {
  colors,
  fonts,
  glassCard,
  radius,
  spacing,
  typography,
} from '../theme/theme';

export function OnboardingScreen() {
  const { createUser } = useApp();
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const result = validateName(name);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.stars}>✦ · ✧ · ✦</Text>
        <Text style={typography.title}>Welcome to Stillsky</Text>
        <Text style={[typography.body, styles.lead]}>
          Every focused session lights a star in your sky.
        </Text>
        <Text style={typography.heading}>What should we call you?</Text>
        <TextInput
          testID={TID.onboarding.nameInput}
          accessibilityLabel="Your name"
          style={styles.input}
          value={name}
          onChangeText={text => {
            setName(text);
            setTouched(true);
          }}
          placeholder="Your name"
          placeholderTextColor={colors.muted}
          autoFocus
          returnKeyType="done"
        />
        <View style={styles.hintRow}>
          {touched && !result.ok ? (
            <Text
              testID={TID.onboarding.nameError}
              accessibilityLabel={result.error}
              style={styles.error}
            >
              {result.error}
            </Text>
          ) : null}
        </View>
        <Pressable
          testID={TID.onboarding.beginButton}
          accessibilityLabel="Begin"
          accessibilityRole="button"
          accessibilityState={{ disabled: !result.ok }}
          disabled={!result.ok}
          onPress={() => result.ok && createUser(result.value)}
          style={[styles.button, !result.ok && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Begin</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  stars: {
    color: colors.star,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: 6,
  },
  lead: { color: colors.muted, marginBottom: spacing.xl },
  input: {
    ...glassCard,
    color: colors.text,
    padding: spacing.md,
    fontSize: 18,
    fontFamily: fonts.regular,
  },
  hintRow: { minHeight: 20 },
  error: { color: colors.danger, fontFamily: fonts.regular },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontFamily: fonts.medium,
  },
});
