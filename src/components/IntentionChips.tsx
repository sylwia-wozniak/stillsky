import React from 'react';
import { ScrollView } from 'react-native';
import { INTENTIONS, type Intention } from '../domain/types';
import { TID } from '../testIds';
import { Chip } from './Chip';

export function IntentionChips({ value, onChange }: { value: Intention; onChange(intention: Intention): void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
      {INTENTIONS.map(t => (
        <Chip
          key={t.id}
          label={t.label}
          selected={t.id === value}
          onPress={() => onChange(t.id)}
          testID={TID.focus.intention(t.id)}
          accessibilityLabel={`Intention ${t.label}`}
        />
      ))}
    </ScrollView>
  );
}
