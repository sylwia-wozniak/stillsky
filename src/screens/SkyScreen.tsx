import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkyCanvas } from '../components/SkyCanvas';
import { getSkyState } from '../domain/constellations';
import { useApp } from '../state/AppProvider';
import { TID } from '../testIds';
import { colors, fonts, radius, spacing, typography } from '../theme/theme';

export function SkyScreen() {
  const { sessions } = useApp();
  const sky = useMemo(() => getSkyState(sessions), [sessions]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sky.constellations.find(c => c.id === selectedId) ?? null;
  const litLabel = `${sky.totalLit} ${
    sky.totalLit === 1 ? 'star' : 'stars'
  } lit`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.title}>My Sky</Text>
        <Text
          style={typography.caption}
          testID={TID.sky.litCount}
          accessibilityLabel={litLabel}
        >
          {litLabel}
        </Text>
      </View>
      {sky.totalLit === 0 ? (
        <View style={styles.empty}>
          <Text
            style={[typography.body, styles.emptyText]}
            testID={TID.sky.emptyState}
            accessibilityLabel="Complete a focus session to light your first star"
          >
            Complete a focus session to light your first star
          </Text>
        </View>
      ) : (
        <ScrollView>
          <SkyCanvas sky={sky} onSelect={setSelectedId} />
        </ScrollView>
      )}

      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedId(null)}
      >
        <View style={styles.backdrop}>
          {selected && (
            <View style={styles.card} testID={TID.sky.card}>
              <Text
                style={typography.heading}
                testID={TID.sky.cardName}
                accessibilityLabel={selected.name}
              >
                {selected.name}
              </Text>
              <Text
                style={typography.body}
                testID={TID.sky.cardProgress}
                accessibilityLabel={`${selected.lit}/${selected.total} stars`}
              >
                {selected.lit}/{selected.total} stars
              </Text>
              <Text
                style={typography.caption}
                testID={TID.sky.cardDate}
                accessibilityLabel={
                  selected.completedAt
                    ? `Completed ${new Date(
                        selected.completedAt,
                      ).toLocaleDateString()}`
                    : 'In progress'
                }
              >
                {selected.completedAt
                  ? `Completed ${new Date(
                      selected.completedAt,
                    ).toLocaleDateString()}`
                  : 'In progress'}
              </Text>
              <Pressable
                testID={TID.sky.cardClose}
                accessibilityLabel="Close"
                accessibilityRole="button"
                onPress={() => setSelectedId(null)}
                style={styles.close}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: { color: colors.muted, textAlign: 'center' },
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
    gap: spacing.sm,
  },
  close: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  closeText: { color: colors.accent, fontSize: 16, fontFamily: fonts.medium },
});
