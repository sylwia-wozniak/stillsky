import React from 'react';
import { ScrollView } from 'react-native';
import { Chip } from './Chip';

interface DurationPickerProps {
  options: number[];
  value: number;
  onChange(min: number): void;
  testIdFor(min: number): string;
}

export function DurationPicker({ options, value, onChange, testIdFor }: DurationPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
      {options.map(m => (
        <Chip
          key={m}
          label={`${m} min`}
          selected={m === value}
          onPress={() => onChange(m)}
          testID={testIdFor(m)}
          accessibilityLabel={`${m} minutes`}
        />
      ))}
    </ScrollView>
  );
}
