import React from 'react';
import { ScrollView } from 'react-native';
import { TAGS, type Tag } from '../domain/types';
import { TID } from '../testIds';
import { Chip } from './Chip';

export function TagChips({ value, onChange }: { value: Tag; onChange(tag: Tag): void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
      {TAGS.map(t => (
        <Chip
          key={t.id}
          label={t.label}
          selected={t.id === value}
          onPress={() => onChange(t.id)}
          testID={TID.focus.tag(t.id)}
          accessibilityLabel={`Tag ${t.label}`}
        />
      ))}
    </ScrollView>
  );
}
