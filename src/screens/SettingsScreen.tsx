import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { version } from '../../package.json';
import { testFeaturesEnabled } from '../app/testFeatures';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DurationPicker } from '../components/DurationPicker';
import { durationOptions, validateName } from '../domain/validation';
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

export function SettingsScreen() {
  const { user, settings, renameUser, updateSettings, resetAll, seedDemoData } =
    useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [confirmReset, setConfirmReset] = useState(false);
  const nameResult = validateName(name);
  const nameChanged = nameResult.ok && nameResult.value !== user?.name;

  useEffect(() => setName(user?.name ?? ''), [user?.name]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={typography.title}>Settings</Text>

        <Text style={styles.section}>Name</Text>
        <View style={styles.nameRow}>
          <TextInput
            testID={TID.settings.nameInput}
            accessibilityLabel="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
          />
          <Pressable
            testID={TID.settings.saveNameButton}
            accessibilityLabel="Save name"
            accessibilityRole="button"
            accessibilityState={{ disabled: !nameChanged }}
            disabled={!nameChanged}
            onPress={() => nameResult.ok && renameUser(nameResult.value)}
            style={[styles.saveButton, !nameChanged && styles.disabled]}
          >
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
        {!nameResult.ok ? (
          <Text
            style={styles.error}
            testID={TID.settings.nameError}
            accessibilityLabel={nameResult.error}
          >
            {nameResult.error}
          </Text>
        ) : null}

        <Text style={styles.section}>Default duration · minutes</Text>
        <DurationPicker
          options={durationOptions(false)}
          value={settings.defaultDurationMin}
          onChange={m => updateSettings({ defaultDurationMin: m })}
          testIdFor={TID.settings.duration}
          testID={TID.settings.durationPicker}
        />

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sound</Text>
            <Switch
              testID={TID.settings.soundToggle}
              accessibilityLabel="Sound"
              value={settings.sound}
              onValueChange={v => updateSettings({ sound: v })}
              trackColor={{ true: colors.accent, false: colors.glassStrong }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Keep screen awake during focus</Text>
            <Switch
              testID={TID.settings.keepAwakeToggle}
              accessibilityLabel="Keep screen awake during focus"
              value={settings.keepAwake}
              onValueChange={v => updateSettings({ keepAwake: v })}
              trackColor={{ true: colors.accent, false: colors.glassStrong }}
            />
          </View>
        </View>

        <Pressable
          testID={TID.settings.resetButton}
          accessibilityLabel="Reset all data"
          accessibilityRole="button"
          onPress={() => setConfirmReset(true)}
          style={styles.dangerButton}
        >
          <Text style={styles.dangerText}>Reset all data</Text>
        </Pressable>

        {testFeaturesEnabled() ? (
          <Pressable
            testID={TID.settings.seedButton}
            accessibilityLabel="Seed demo data"
            accessibilityRole="button"
            onPress={seedDemoData}
            style={styles.devButton}
          >
            <Text style={styles.devText}>Seed demo data (test builds only)</Text>
          </Pressable>
        ) : null}

        <Text
          style={styles.version}
          testID={TID.settings.version}
          accessibilityLabel={`Version ${version}`}
        >
          Version {version}
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={confirmReset}
        message="This deletes your name, settings and every star. Type RESET to confirm."
        confirmLabel="Reset"
        requireText="RESET"
        onConfirm={() => {
          setConfirmReset(false);
          resetAll();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  section: {
    ...typography.caption,
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  nameRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    ...glassCard,
    flex: 1,
    color: colors.text,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  saveText: { color: colors.onPrimary, fontFamily: fonts.medium },
  disabled: { opacity: 0.35 },
  error: { color: colors.danger, fontFamily: fonts.regular },
  card: { ...glassCard, paddingHorizontal: spacing.md, marginTop: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glassBorder,
  },
  rowLabel: { ...typography.body, flex: 1, marginRight: spacing.md },
  dangerButton: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.pill,
    padding: spacing.md,
    alignItems: 'center',
  },
  dangerText: { color: colors.danger, fontSize: 16, fontFamily: fonts.regular },
  devButton: {
    ...glassCard,
    borderRadius: radius.pill,
    padding: spacing.md,
    alignItems: 'center',
  },
  devText: { color: colors.muted, fontFamily: fonts.regular },
  version: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
