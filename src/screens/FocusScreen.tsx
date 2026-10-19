import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  activateKeepAwake,
  deactivateKeepAwake,
} from '@sayem314/react-native-keep-awake';
import type { TabParamList } from '../app/RootNavigator';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DurationPicker } from '../components/DurationPicker';
import { Star } from '../components/Star';
import { IntentionChips } from '../components/IntentionChips';
import { greeting } from '../domain/greeting';
import { formatMMSS, progress, remainingMs } from '../domain/timer';
import type { Intention } from '../domain/types';
import { testFeaturesEnabled } from '../app/testFeatures';
import { durationOptions } from '../domain/validation';
import { playChime } from '../sound';
import { useApp } from '../state/AppProvider';
import { TID } from '../testIds';
import {
  colors,
  fonts,
  glassCard,
  radius,
  spacing,
  tabBarStyle,
  typography,
} from '../theme/theme';

type Nav = BottomTabNavigationProp<TabParamList, 'Focus'>;

export function FocusScreen() {
  const navigation = useNavigation<Nav>();
  const { user, settings, activeSession, startSession, giveUp, finishIfDue } =
    useApp();
  const options = durationOptions(testFeaturesEnabled());
  const [duration, setDuration] = useState(settings.defaultDurationMin);
  const [intention, setIntention] = useState<Intention>('work');
  const [now, setNow] = useState(() => new Date());
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const [falling, setFalling] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const running = activeSession !== null;

  // Follow the default duration from Settings while idle.
  useEffect(() => {
    if (!running) setDuration(settings.defaultDurationMin);
  }, [settings.defaultDurationMin, running]);

  // Hide the tab bar while focusing.
  useEffect(() => {
    navigation.setOptions({
      // Options merge shallowly, so always pass the full glass style.
      tabBarStyle: running ? { ...tabBarStyle, display: 'none' } : tabBarStyle,
    });
  }, [navigation, running]);

  useEffect(() => {
    if (!running || !settings.keepAwake) return;
    activateKeepAwake();
    return () => deactivateKeepAwake();
  }, [running, settings.keepAwake]);

  const tick = useCallback(async () => {
    const t = new Date();
    setNow(t);
    const done = await finishIfDue(t);
    if (done) {
      setJustCompleted(true);
      if (settings.sound) playChime();
    }
  }, [finishIfDue, settings.sound]);

  useEffect(() => {
    if (!running) return;
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  // Coming back to this tab refreshes the greeting (tabs stay mounted for hours).
  useFocusEffect(
    useCallback(() => {
      if (!running) setNow(new Date());
    }, [running]),
  );

  // Coming back to the app refreshes the clock (greeting, countdown) even while idle.
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s !== 'active') return;
      if (running) tick();
      else setNow(new Date());
    });
    return () => sub.remove();
  }, [running, tick]);

  // A Give-up dialog left open when the session ends must not come back next session.
  useEffect(() => {
    if (!running) setConfirmGiveUp(false);
  }, [running]);

  const onConfirmGiveUp = async () => {
    setConfirmGiveUp(false);
    setFalling(true);
    await giveUp();
  };
  const onFallEnd = useCallback(() => setFalling(false), []);

  const hour = now.getHours();
  const name = user?.name ?? '';

  const giveUpDialog = (
    // Kept mounted outside the state branches: unmounting a visible Modal on iOS leaves
    // XCUITest unable to read the view hierarchy.
    <ConfirmDialog
      visible={confirmGiveUp && running}
      message="Your star will fall. Give up?"
      confirmLabel="Give up"
      onConfirm={onConfirmGiveUp}
      onCancel={() => setConfirmGiveUp(false)}
    />
  );

  if (justCompleted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Star brightness={1} flash />
          <Text
            style={typography.title}
            testID={TID.focus.completedMessage}
            accessibilityLabel="You earned a star ✨"
          >
            You earned a star ✨
          </Text>
          <View style={styles.row}>
            <Pressable
              testID={TID.focus.viewInSkyButton}
              accessibilityLabel="View in sky"
              accessibilityRole="button"
              style={[styles.button, styles.secondary]}
              onPress={() => {
                setJustCompleted(false);
                navigation.navigate('Sky');
              }}
            >
              <Text style={styles.secondaryText}>View in sky</Text>
            </Pressable>
            <Pressable
              testID={TID.focus.doneButton}
              accessibilityLabel="Done"
              accessibilityRole="button"
              style={styles.button}
              onPress={() => setJustCompleted(false)}
            >
              <Text style={styles.buttonText}>Done</Text>
            </Pressable>
          </View>
        </View>
        {giveUpDialog}
      </SafeAreaView>
    );
  }

  if (running && activeSession) {
    const left = formatMMSS(remainingMs(activeSession, now));
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={typography.caption}>Stay with it…</Text>
          <Star brightness={progress(activeSession, now)} />
          <Text
            style={typography.timer}
            testID={TID.focus.timerText}
            accessibilityLabel={left}
          >
            {left}
          </Text>
          <Pressable
            testID={TID.focus.giveUpButton}
            accessibilityLabel="Give up"
            accessibilityRole="button"
            style={[styles.button, styles.secondary]}
            onPress={() => setConfirmGiveUp(true)}
          >
            <Text style={styles.secondaryText}>Give up</Text>
          </Pressable>
        </View>
        {giveUpDialog}
      </SafeAreaView>
    );
  }

  const greet = greeting(name, hour);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.idle}>
        <Text
          style={typography.heading}
          testID={TID.focus.greeting}
          accessibilityLabel={greet}
        >
          {greet}
        </Text>
        <Star brightness={0} falling={falling} onFallEnd={onFallEnd} />
        <Text style={styles.label}>Duration · minutes</Text>
        <DurationPicker
          options={options}
          value={duration}
          onChange={setDuration}
          testIdFor={TID.focus.duration}
          testID={TID.focus.durationPicker}
        />
        <Text style={styles.label}>Intention</Text>
        <IntentionChips value={intention} onChange={setIntention} />
        <Pressable
          testID={TID.focus.startButton}
          accessibilityLabel="Start"
          accessibilityRole="button"
          style={[styles.button, styles.start]}
          onPress={() => {
            setNow(new Date()); // first running frame shows the full duration
            startSession(duration, intention);
          }}
        >
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
      </View>
      {giveUpDialog}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  idle: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  label: {
    ...typography.caption,
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', gap: spacing.md },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  start: { marginTop: 'auto', marginBottom: spacing.md },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontFamily: fonts.medium,
  },
  secondary: {
    ...glassCard,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.regular,
  },
});
