import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from '../components/BarChart';
import { computeStats, formatMinutes, type Period } from '../domain/stats';
import { INTENTIONS } from '../domain/types';
import { useApp } from '../state/AppProvider';
import { TID } from '../testIds';
import { colors, spacing, typography } from '../theme/theme';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function barLabels(period: Period, count: number): string[] {
  if (period === 'week') return WEEKDAYS;
  if (period === 'day') return Array.from({ length: count }, (_, i) => String(i));
  return Array.from({ length: count }, (_, i) => String(i + 1));
}

function Tile({ label, value, testID }: { label: string; value: string; testID: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue} testID={testID} accessibilityLabel={value}>
        {value}
      </Text>
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

export function StatsScreen() {
  const { sessions } = useApp();
  const [period, setPeriod] = useState<Period>('day');
  const stats = useMemo(() => computeStats(sessions, period, new Date()), [sessions, period]);
  const empty = stats.completed + stats.failed === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.title}>Stats</Text>
        <View style={styles.segment} accessibilityRole="tablist">
          {PERIODS.map(p => {
            const selected = p.id === period;
            return (
              <Pressable
                key={p.id}
                testID={TID.stats.period(p.id)}
                accessibilityLabel={p.label}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setPeriod(p.id)}
                style={[styles.segmentItem, selected && styles.segmentSelected]}>
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {empty ? (
          <Text
            style={[typography.body, styles.empty]}
            testID={TID.stats.emptyState}
            accessibilityLabel="No sessions in this period yet">
            No sessions in this period yet
          </Text>
        ) : (
          <>
            <View style={styles.tiles}>
              <Tile label="Focus time" value={formatMinutes(stats.totalMin)} testID={TID.stats.totalTime} />
              <Tile label="Stars earned" value={String(stats.completed)} testID={TID.stats.completed} />
              <Tile label="Stars fallen" value={String(stats.failed)} testID={TID.stats.failed} />
              <Tile
                label="Success rate"
                value={stats.successRate === null ? '—' : `${stats.successRate}%`}
                testID={TID.stats.successRate}
              />
            </View>
            <Text style={styles.section}>Focus minutes</Text>
            <BarChart
              values={stats.bars}
              labels={barLabels(period, stats.bars.length)}
              labelEvery={period === 'week' ? 1 : period === 'day' ? 3 : 5}
            />
            <Text style={styles.section}>By intention</Text>
            {INTENTIONS.map(t => (
              <View key={t.id} style={styles.intentionRow}>
                <Text style={typography.body}>{t.label}</Text>
                <Text
                  style={typography.body}
                  testID={TID.stats.intentionMinutes(t.id)}
                  accessibilityLabel={formatMinutes(stats.intentionMinutes[t.id])}>
                  {formatMinutes(stats.intentionMinutes[t.id])}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 20, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: spacing.sm, borderRadius: 16, alignItems: 'center' },
  segmentSelected: { backgroundColor: colors.accent },
  segmentText: { color: colors.text },
  segmentTextSelected: { color: colors.background, fontWeight: '600' },
  empty: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '48%', backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, gap: 4 },
  tileValue: { fontSize: 24, fontWeight: '600', color: colors.star },
  section: { ...typography.caption, marginTop: spacing.md },
  intentionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
});
